// import * as grpc from '@grpc/grpc-js';
// import { connect, Contract, Gateway, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
// import * as crypto from 'crypto';
// import * as path from 'path';

// import { promises as fs } from 'fs';
// const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
// const chaincodeName = envOrDefault('CHAINCODE_NAME', 'asset-transfer');
// const mspId = envOrDefault('MSP_ID', 'Org1MSP');
// //Local development and testing uncomment below code
// import { CLIENT_CERT_PATH, GATEWAY_ENDPOINT, HOST_ALIAS, MSP_ID, PRIVATE_KEY_PATH, TLS_CERT_PATH } from './config';
// export class Connection {
//     public static contract: Contract;
//     public init() {
//       console.log('CLIENT_CERT_PATH', CLIENT_CERT_PATH)
//       console.log('GATEWAY_ENDPOINT', GATEWAY_ENDPOINT)
//       console.log('MSP_ID',MSP_ID )
//       console.log('PRIVATE_KEY_PATH', PRIVATE_KEY_PATH)
//       console.log('TLS_CERT_PATH', TLS_CERT_PATH)
//       console.log('HOST_ALIAS',HOST_ALIAS)
//         initFabric();
//     }
// }
// async function initFabric(): Promise<void> {
//     // The gRPC client connection should be shared by all Gateway connections to this endpoint.
//     const client = await newGrpcConnection();
//     const gateway = await newGatewayConnection(client);
//     console.log('gateway')
//     console.log(gateway)
//     try {
//         // Get a network instance representing the channel where the smart contract is deployed.
//         const network = gateway.getNetwork(channelName);
//         console.log('network')
//         console.log(network)
//         // Get the smart contract from the network.
//         const contract = network.getContract(chaincodeName);
//         console.log('contract')
//         console.log(contract)
//         Connection.contract = contract;
//         // Initialize a set of asset data on the ledger using the chaincode 'InitLedger' function.
//         //        await initLedger(contract);
//         console.log('Connection')
//         console.log(Connection)
//     } catch (e: any) {
//         console.log('sample log');
//         console.log(e.message);
//     } finally {
//         console.log('error log ');
//         // gateway.close();
//         // client.close();
//     }
// }

// export async function newGatewayConnection(client: grpc.Client): Promise<Gateway> {
//   console.log('client')
//   console.log(client)
//   return connect({
//       client,
//       identity: await newIdentity(),
//       signer: await newSigner(),
//       // Default timeouts for different gRPC calls
//       evaluateOptions: () => {
//           return { deadline: Date.now() + 5000 }; // 5 seconds
//       },
//       endorseOptions: () => {
//           return { deadline: Date.now() + 15000 }; // 15 seconds
//       },
//       submitOptions: () => {
//           return { deadline: Date.now() + 5000 }; // 5 seconds
//       },
//       commitStatusOptions: () => {
//           return { deadline: Date.now() + 60000 }; // 1 minute
//       },
//   });
// }

// export async function newGrpcConnection(): Promise<grpc.Client> {
//   if (TLS_CERT_PATH) {
//       const tlsRootCert = await fs.readFile(TLS_CERT_PATH);
//       const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
//       return new grpc.Client(GATEWAY_ENDPOINT, tlsCredentials, newGrpcClientOptions());
//   }

//   return new grpc.Client(GATEWAY_ENDPOINT, grpc.ChannelCredentials.createInsecure());
// }

// function newGrpcClientOptions(): grpc.ClientOptions {
//   const result: grpc.ClientOptions = {};
//   if (HOST_ALIAS) {
//       result['grpc.ssl_target_name_override'] = HOST_ALIAS; // Only required if server TLS cert does not match the endpoint address we use
//   }
//   return result;
// }


// async function newIdentity(): Promise<Identity> {
//   const certPath = path.resolve(CLIENT_CERT_PATH);
//   const credentials = await fs.readFile(certPath);

//   return { mspId: MSP_ID, credentials };
// }

// async function newSigner(): Promise<Signer> {
//   const keyPath = path.resolve(PRIVATE_KEY_PATH);
//   const privateKeyPem = await fs.readFile(keyPath);
//   const privateKey = crypto.createPrivateKey(privateKeyPem);

//   return signers.newPrivateKeySigner(privateKey);
// }
// /**
//  * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
//  */
// function envOrDefault(key: string, defaultValue: string): string {
//     return process.env[key] || defaultValue;
// }