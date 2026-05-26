#!/usr/bin/env node
import { Command } from 'commander';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { ConnectClient, ListInstancesCommand } from '@aws-sdk/client-connect';
import ora from 'ora';
import { saveConfig } from '../config/loader.js';
import { ServerConfigSchema } from '../config/schema.js';

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
      const sts = new STSClient({
        region: options.region,
      });
      const identity = await sts.send(new GetCallerIdentityCommand({}));
      spinner.succeed(`Authenticated as ${identity.Arn}`);
    } catch (err) {
      spinner.fail(`AWS credentials invalid: ${(err as Error).message}`);
      process.exit(1);
    }

    spinner.start('Looking for Amazon Connect instances...');
    const connect = new ConnectClient({ region: options.region });
    const instances = await connect.send(new ListInstancesCommand({}));
    spinner.stop();

    let instanceId = '';
    if (instances.InstanceSummaryList && instances.InstanceSummaryList.length > 0) {
      console.log(`Found ${instances.InstanceSummaryList.length} instance(s):`);
      instances.InstanceSummaryList.forEach((inst, i) => {
        console.log(`  ${i + 1}. ${inst.InstanceAlias} (${inst.Id})`);
      });
      instanceId = instances.InstanceSummaryList[0].Id!;
    } else {
      console.log('No existing Connect instances found.');
      if (!options.alias) {
        console.error('Provide --alias to create a new instance.');
        process.exit(1);
      }
      spinner.start('Creating Connect instance...');
      console.log('(Instance creation via CLI is not yet implemented. Use AWS Console or CloudFormation.)');
      spinner.fail('Please create an instance manually and re-run init.');
      process.exit(1);
    }

    const config = ServerConfigSchema.parse({
      aws: {
        instanceId,
        region: options.region,
        profile: options.profile,
      },
    });

    spinner.start('Saving configuration...');
    await saveConfig(config);
    spinner.succeed('Configuration saved to ~/.amazon-connect-mcp/config.json');

    console.log('\nRun the server locally with:\n');
    console.log(`  node dist/server.js`);
    console.log('\nOr after publishing to npm:\n');
    console.log(JSON.stringify(
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
    ));
  });

program
  .command('serve')
  .description('Start the MCP server (stdio transport)')
  .action(async () => {
    const { main } = await import('../index.js');
    await main();
  });

program.parse(process.argv);
