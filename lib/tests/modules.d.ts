declare module "@apla/clickhouse" {
    import { Writable } from "stream";

    export type AplaQueryOptions = {
        queryOptions?: {
            node?: string;
            force?: "true";
        };
        dataObjects?: boolean;
        format?: string;
        readonly?: boolean;
    };
    class ClickHouse {
        constructor(props: {
            host: string;
            port: number;
            dataObjects?: boolean;
            syncParser?: boolean;
            user: string;
            password: string;
        });

        querying(
            query: string,
            options?: AplaQueryOptions
        ): Promise<{ data: Record<string, string | number>[] }>;
        pinging(): Promise<void>;
        ping(cb: (e: any) => void): void;
        query(
            str: string,
            options: AplaQueryOptions,
            cb: (e: any) => void
        ): Writable;
        query(str: string, cb: (e: any) => void): Writable;
        query(str: string): Writable;
    }
    export = ClickHouse;
}
