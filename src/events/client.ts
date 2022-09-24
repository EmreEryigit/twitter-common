import { Kafka, logLevel } from "kafkajs";
import { randomBytes } from "crypto";
export const kafka = new Kafka({
    brokers: ['kafka-srv:9092'],
    clientId: process.env.KAFKA_CLIENT_ID,
    logLevel: logLevel.NOTHING,
});


