import { isNumber } from "fp-ts/lib/number";
import { AliasedRowsURI } from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { TableOrSubquery } from "../types";
import { makeArray } from "../utils";
import { Joined } from "./joined";
import { SelectStatement } from "./select-statement";
import { Table } from "./table";

type SelectionOfSelectStatement<T> = T extends SelectStatement<
    infer With,
    infer Scope,
    infer Selection
>
    ? Selection
    : never;

export class Compound<Scope extends string, Selection extends string> {
    private constructor(
        public __content: TableOrSubquery<any, any, any, any>[],
        public __qualifier: "UNION" | "UNION ALL" | "INTERSECT" | "EXCEPT",
        public __orderBy: SafeString[],
        public __limit: SafeString | number | null
    ) {}

    public static union = <
        C extends SelectStatement<any, any, any>,
        CS extends SelectStatement<any, any, any>[]
    >(
        content: [C, ...CS]
    ): Compound<
        SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>,
        SelectionOfSelectStatement<C>
    > => new Compound(content, "UNION", [], null);

    public static unionAll = <
        C extends SelectStatement<any, any, any>,
        CS extends SelectStatement<any, any, any>[]
    >(
        content: [C, ...CS]
    ): Compound<
        SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>,
        SelectionOfSelectStatement<C>
    > => new Compound(content, "UNION ALL", [], null);

    private copy = (): Compound<Scope, Selection> =>
        new Compound(
            this.__content,
            this.__qualifier,
            this.__orderBy,
            this.__limit
        );

    public orderBy = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): Compound<Scope, Selection> => {
        const t = this.copy();
        t.__orderBy = [...t.__orderBy, ...makeArray(f(proxy))];
        return t;
    };

    public limit = (limit: SafeString | number): Compound<Scope, Selection> => {
        const t = this.copy();
        t.__limit = limit;
        return t;
    };

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection | `main_alias.${Selection}`, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<
        never,
        Selection | `main_alias.${Selection}`,
        NewSelection
    > =>
        SelectStatement.__fromTableOrSubquery(this, [
            { _tag: AliasedRowsURI, content: f(proxy) },
        ]);

    public joinTable = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisQueryAlias: Alias1,
        operator: string,
        table: Table<Selection2, Alias2>,
        on?: (
            f: Record<
                | Exclude<Selection, Selection2>
                | Exclude<Selection2, Selection>
                | `${Alias1}.${Selection}`
                | `${Alias2}.${Selection2}`,
                SafeString
            >
        ) => SafeString | SafeString[]
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias1 | Alias2
    > =>
        Joined.__fromProperJoin(
            [
                {
                    code: this,
                    alias: thisQueryAlias,
                },
            ],
            [
                {
                    code: table,
                    alias: table.__alias,
                    operator,
                    constraint: on != null ? makeArray(on(proxy)) : [],
                },
            ]
        );

    public __printProtected = (parenthesis: boolean): string => {
        const sel = this.__content
            .map((it) => it.__printProtected(false))
            .join(` ${this.__qualifier} `);

        const orderBy =
            this.__orderBy.length > 0
                ? `ORDER BY ${this.__orderBy
                      .map((it) => it.content)
                      .join(", ")}`
                : "";

        const limit = this.__limit
            ? isNumber(this.__limit)
                ? `LIMIT ${this.__limit}`
                : `LIMIT ${this.__limit.content}`
            : "";

        const q = [sel, orderBy, limit].filter((it) => it.length > 0).join(" ");

        if (parenthesis) {
            return `(${q})`;
        }
        return q;
    };
    public print = (): string => `${this.__printProtected(false)};`;
}

export const union = Compound.union;

export const unionAll = Compound.unionAll;
