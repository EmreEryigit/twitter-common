import { kafka } from "./client";

/* const consumer = kafka.consumer({ groupId: "asdgasd" });

export const consume = async () => {
    await consumer.connect();
    await consumer.subscribe({
        topic: "test",
        fromBeginning: true,
    });

    await consumer.on("consumer.group_join", (event) => {
        console.log(event.type);
    });

    await consumer.run({
        eachMessage: async ({ message }) => {
            console.log(message.value?.toString());
        },
    });
}; */

import {
    Consumer,
    ConsumerSubscribeTopics,
    EachBatchPayload,
    Kafka,
    EachMessagePayload,
    KafkaMessage,
} from "kafkajs";
import { randomBytes } from "crypto";
import { Event, Topics } from "./types";

export abstract class ConsumerFactory<T extends Event> {
    private kafkaConsumer: Consumer;
    abstract topic: T["topic"];
    abstract onMessage(data: T["data"]): Promise<void>;
    protected client: Kafka;
    public constructor(client: Kafka, protected groupId: string) {
        this.client = client;
        this.groupId = groupId;

        this.kafkaConsumer = this.createKafkaConsumer();
    }

    private async crashHandler(error: any) {
        // This logic is based on kafkajs implementation: https://github.com/tulios/kafkajs/blob/master/src/consumer/index.js#L257
        if (
            error &&
            error.name !== "KafkaJSNumberOfRetriesExceeded" ||
            error.retriable !== true
        ) {
            await this.restartConsumer();
        }
    }
    private async restartConsumer() {
        await this.startConsumer();
    }
    public async startConsumer(): Promise<void> {
        console.log("abstract start consumer", this.groupId);
        const topic: ConsumerSubscribeTopics = {
            topics: [this.topic],
            fromBeginning: true,
        };

        try {
            await this.kafkaConsumer.connect();
            await this.kafkaConsumer.subscribe(topic);

            await this.kafkaConsumer.run({
                eachMessage: async (messagePayload: EachMessagePayload) => {
                    console.log(`
                        Message received: ${this.topic} => ${this.groupId}
                    `);
                    this.kafkaConsumer.on("consumer.crash", async (event) => {
                        const error = event.payload.error;
                        await this.crashHandler(error);
                    });
                    const { topic, partition, message } = messagePayload;
                    const parsedMsg = this.parseMessage(message);
                    await this.onMessage(parsedMsg);

                    const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
                    console.log(prefix, JSON.parse(message.value!.toString()));
                },
            });
        } catch (error) {
            console.log("Error: ", error);
        }
    }
    async parseMessage(msg: KafkaMessage): Promise<T["data"]> {
        return await JSON.parse(msg.value!.toString());
    }

    public async startBatchConsumer(): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: [this.topic],
            fromBeginning: true,
        };

        try {
            await this.kafkaConsumer.connect();
            await this.kafkaConsumer.subscribe(topic);
            await this.kafkaConsumer.run({
                eachBatch: async (eachBatchPayload: EachBatchPayload) => {
                    const { batch } = eachBatchPayload;
                    for (const message of batch.messages) {
                        if (
                            !eachBatchPayload.isRunning() ||
                            eachBatchPayload.isStale()
                        )
                            break;
                        console.log(
                            `Message received: ${this.topic} => ${this.groupId}`
                        );
                        const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
                        const parsedMsg = await this.parseMessage(message);
                        await this.onMessage(parsedMsg);

                        eachBatchPayload.resolveOffset(message.offset);
                        await eachBatchPayload.heartbeat();
                    }
                },
            });
            this.kafkaConsumer.on("consumer.crash", async (event) => {
                const error = event.payload.error;
                await this.crashHandler(error);
            });
        } catch (error) {
            console.log("Error: ", error);
        }
    }

    public async shutdown(): Promise<void> {
        await this.kafkaConsumer.disconnect();
    }

    private createKafkaConsumer(): Consumer {
        /*  const kafka = new Kafka({
            clientId: "client-id",
            brokers: ["localhost:9092"],
        }); */

        const consumer = this.client.consumer({ groupId: this.groupId });
        return consumer;
    }
}
