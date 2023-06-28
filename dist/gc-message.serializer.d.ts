import { ReadPacket, Serializer } from '@nestjs/microservices';
import { GCPubSubMessage } from './gc-message.builder';
export declare class GCPubSubMessageSerializer
  implements Serializer<ReadPacket, GCPubSubMessage>
{
  constructor();
  serialize(packet: ReadPacket<any> | any): GCPubSubMessage<any, any>;
}
