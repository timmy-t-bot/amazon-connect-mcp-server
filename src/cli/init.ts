#!/usr/bin/env node
import { Command } from 'commander';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import ora from 'ora';
import { saveConfig } from '../config/loader.js';
import { ServerConfigSchema } from '../config/schema.js';
import { ConnectProvisioner } from '../connect/provisioner.js';

const program = new Command();

program
  .name('amazon-connect-mcp-server')
  .description('MCP server for Amazon Connect')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize the Amazon Connect MCP server')
  .option('-p, --profile <profile>', 'AWS profile', 'default')
  .option('-r, --region <region>', 'AWS region', 'us-east-1')
  .option('-a, --alias <alias>', 'Connect instance alias')
  .action(async (options) => {
    const spinner = ora('Validating AWS credentials...').start();
    try {
      const sts = new STSClient({ region: options.region });
      const identity = await sts.send(new GetCallerIdentityCommand({}));
      spinner.succeed(`Authenticated as ${identity.Arn}`);
    } catch (err) {
      spinner.fail(`AWS credentials invalid: ${(err as Error).message}`);
      process.exit(1);
    }

    const provisioner = new ConnectProvisioner(options.region);

    spinner.start('Looking for Amazon Connect instances...');
    let instanceId: string | undefined;
    try {
      const result = await provisioner.findOrCreateInstance(
        options.alias ?? 'amazon-connect-mcp'
      );
      instanceId = result.Id;
      if (instanceId) {
        spinner.succeed(
          `Using Connect instance: ${result.InstanceAlias} (${instanceId})`
        );
      } else {
        spinner.fail('Instance creation did not return an ID.');
        process.exit(1);
      }
    } catch (err) {
      spinner.fail(`Failed to find or create instance: ${(err as Error).message}`);
      process.exit(1);
    }

    spinner.start('Checking existing resources...');
    const resources = await provisioner.getExistingResources(instanceId);
    spinner.succeed(
      `Found ${resources.flows.length} contact flow(s), ${resources.numbers.length} phone number(s)`
    );

    let contactFlowId = '';
    if (resources.flows.length === 0) {
      spinner.start('Creating outbound reminder contact flow...');
      try {
        const flow = await provisioner.createOutboundReminderFlow(instanceId);
        contactFlowId = flow.ContactFlowId ?? '';
        spinner.succeed(`Created contact flow: ${contactFlowId}`);
      } catch (err) {
        spinner.warn(`Could not create contact flow: ${(err as Error).message}`);
      }
    } else {
      const outboundFlow = resources.flows.find(
        (f) => f.Name === 'OutboundReminder'
      );
      contactFlowId = outboundFlow?.Id ?? resources.flows[0].Id ?? '';
    }

    spinner.start('Saving configuration...');
    const config = ServerConfigSchema.parse({
      aws: {
        instanceId,
        region: options.region,
        profile: options.profile,
        contactFlows: contactFlowId ? { outboundReminder: contactFlowId } : undefined,
      },
    });
    await saveConfig(config);
    spinner.succeed('Configuration saved to ~/.amazon-connect-mcp/config.json');

    console.log('\nRun the server locally with:\n');
    console.log(`  node dist/cli/init.js serve`);
    console.log('\nOr after publishing to npm, add this to your MCP client config:\n');
    console.log(
      JSON.stringify(
        {
          mcpServers: {
            'amazon-connect': {
              command: 'npx',
              args: ['amazon-connect-mcp-server', 'serve'],
              env: {
                AWS_PROFILE: options.profile,
                AWS_REGION: options.region,
              },
            },
          },
        },
        null,
        2
      )
    );
  });

program
  .command('serve')
  .description('Start the MCP server (stdio transport)')
  .action(async () => {
    const { main } = await import('../index.js');
    await main();
  });

program.parse(process.argv);
