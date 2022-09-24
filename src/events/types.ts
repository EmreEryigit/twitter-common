
export enum Topics {
    PostCreated = "post-created",
    PostUpdated = "post-updated",
    CommentCreated = "comment-created",
    CommentUpdated = "comment-updated",
    UserCreated = "user-created",
}

export interface Event {
    topic: Topics;
    data: any;
}

export interface CustomMessageFormat<T extends Event> {
    data: T["data"];
}

export interface UserCreatedEvent {
    topic: Topics.UserCreated;
    data: {
        id: number;
        email: string;
        name: string;
    };
}