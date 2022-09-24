import { kafka } from "./client";
import {
    Kafka,
    Message,
    Producer,
    ProducerBatch,
    TopicMessages,
} from "kafkajs";
import { Event } from "./types";

export abstract class ProducerFactory<T extends Event> {
    private producer: Producer;
    abstract topic: T["topic"];
    protected client: Kafka;
    constructor(client: Kafka) {
        this.client = client;
        this.producer = this.createProducer();
    }

    public async start(): Promise<void> {
        try {
            await this.producer.connect();
        } catch (error) {
            console.log("Error connecting the producer: ", error);
        }
    }

    public async shutdown(): Promise<void> {
        await this.producer.disconnect();
    }

    public async sendBatch(messages: Array<T["data"]>): Promise<void> {
        const kafkaMessages: Array<Message> = messages.map((message) => {
            return {
                value: JSON.stringify(message),
                key: "key1",
                partition: 0,
            };
        });

        const topicMessages: TopicMessages = {
            topic: this.topic,
            messages: kafkaMessages,
        };

        const batch: ProducerBatch = {
            topicMessages: [topicMessages],
        };

        await this.producer.sendBatch(batch);
    }

    private createProducer(): Producer {
        /*  kafka = new Kafka({
            clientId: "producer-client",
            brokers: ["localhost:9092"],
        }); */

        return this.client.producer();
    }
}
