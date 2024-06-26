import {
  OutgoingResponse,
  ReadPacket,
  Serializer,
} from '@nestjs/microservices';
import { GCPubSubMessage, GCPubSubMessageBuilder } from './gc-message.builder';

export class GCPubSubMessageSerializer
  implements Serializer<ReadPacket, GCPubSubMessage>
{
  serialize(packet: ReadPacket<any> | any): GCPubSubMessage<any, any> {
    let message: GCPubSubMessage;

    if (packet.data instanceof GCPubSubMessage) {
      message = packet.data as GCPubSubMessage;
    } else {
      message = new GCPubSubMessageBuilder(packet.data).build();
    }

    return {
      ...message,
      data: Buffer.from(JSON.stringify(message.data)),
    };
  }
}

export class GCPubSubResponseSerializer
  implements Serializer<OutgoingResponse, GCPubSubMessage>
{
  serialize(value: OutgoingResponse): GCPubSubMessage<any, any> {
    const message = new GCPubSubMessageBuilder(value).build();

    return {
      ...message,
      data: Buffer.from(JSON.stringify(message.data)),
    };
  }
}
