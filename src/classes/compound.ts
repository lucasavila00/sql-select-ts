/**
 * Represents https://www.sqlite.org/syntax/compound-select-stmt.html
 *
 *
 * @since 2.0.0
 */
import { consumeArrayCallback } from "../consume-fields";
import { StarSymbol } from "../data-wrappers";
import { printCompound } from "../print";
import { SafeString } from "../safe-string";
import {
    Fields,
    Joinable,
    NoSelectFieldsCompileError,
    ScopeStorage,
    SelectionRecord,
    TableOrSubquery,
} from "../types";
import { makeArray } from "../utils";
import { Joined, JoinedFactory } from "./joined";
import { AliasedSelectStatement, SelectStatement } from "./select-statement";

/**
 * Represents https://www.sqlite.org/syntax/compound-select-stmt.html
 *
 * This class is not meant to be used directly, but rather through the `union`, `union`, `intersect`, `except` functions.
 *
 * @since 2.0.0
 */
export class Compound {
    /* @internal */
    protected constructor(
        /* @internal */
        public __props: {
            readonly content: ReadonlyArray<TableOrSubquery>;
            readonly qualifier: "UNION" | "UNION ALL" | "INTERSECT" | "EXCEPT";
            readonly orderBy: ReadonlyArray<SafeString>;
            readonly limit: SafeString | number | null;
            readonly scope: ScopeStorage;
            readonly alias?: string;
        }
    ) {}

    /**
     * @internal
     */
    public static __fromQualifier =
        (qualifier: "UNION" | "UNION ALL" | "INTERSECT" | "EXCEPT") =>
        (content: ReadonlyArray<SelectStatement | AliasedSelectStatement> & {
            0: SelectStatement | AliasedSelectStatement;
        }): Compound =>
            new Compound({
                content,
                qualifier,
                orderBy: [],
                limit: null,
                scope: Object.fromEntries(
                    content.map((it) => [it.__props.alias, void 0])
                ),
            });

    private copy = (): Compound =>
        new Compound({ ...this.__props });

    private setOrderBy = (orderBy: SafeString[]): this => {
        this.__props = {
            ...this.__props,
            orderBy,
        };
        return this;
    };

    private setLimit = (limit: SafeString | number | null): this => {
        this.__props = {
            ...this.__props,
            limit,
        };
        return this;
    };

    /**
     * @since 2.0.0
     */
    public orderBy = (
        f:
            | ReadonlyArray<string>
            | ((fields: Fields) => ReadonlyArray<SafeString> | SafeString)
    ): Compound =>
        this.copy().setOrderBy([
            ...this.__props.orderBy,
            ...makeArray(consumeArrayCallback(f as any, this.__props.scope)),
        ]);

    /**
     * @since 2.0.0
     */
    public limit = (
        limit: SafeString | number
    ): Compound =>
        this.copy().setLimit(limit);

    /**
     * @since 2.0.0
     */
    public select = (
        _:
            | ReadonlyArray<string>
            | ((
                  fields: Fields & NoSelectFieldsCompileError
              ) => SelectionRecord)
    ): SelectStatement =>
        SelectStatement.__fromTableOrSubquery(
            this,
            _ as any,
            this.__props.scope as any,
            undefined
        );

    /**
     * @since 2.0.0
     */
    public selectStar = (): SelectStatement =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarSymbol()],
            {},
            undefined
        );

    /**
     * @since 2.0.0
     */
    public stringify = (): string => printCompound(this);

    /**
     * @since 2.0.0
     */
    public apply = <Ret extends TableOrSubquery = TableOrSubquery>(
        fn: (it: this) => Ret
    ): Ret => fn(this);
    /**
     * @since 2.0.0
     */
    public as = (as: string): AliasedCompound =>
        new AliasedCompound(this.__props).__setAlias(as) as any;
}

/**
 * @since 2.0.0
 */
export class AliasedCompound extends Compound {
    private __copy = (): AliasedCompound =>
        new AliasedCompound({ ...this.__props });

    /**
     * @internal
     */
    public __setAlias = (alias: string): this => {
        this.__props = {
            ...this.__props,
            alias,
            scope: {
                ...this.__props.scope,
                [alias]: void 0,
            },
        };
        return this;
    };

    /**
     * @since 2.0.0
     */
    public join = (operator: string, _: Joinable): JoinedFactory =>
        JoinedFactory.__fromAll(
            [this],
            [],
            {
                code: _ as any,
                operator,
            },
            {
                [String(this.__props.alias)]: void 0,
                ...(_ as any).__props.scope,
            }
        );

    /**
     * @since 2.0.0
     */
    public commaJoin = (_: Joinable): Joined =>
        Joined.__fromAll([this, _ as any], [], {
            [String(this.__props.alias)]: void 0,
            ...(_ as any).__props.scope,
        });

    /**
     * @since 2.0.0
     */
    public apply = <Ret extends TableOrSubquery = TableOrSubquery>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    /**
     * @since 2.0.0
     */
    public as = (as: string): AliasedCompound =>
        this.__copy().__setAlias(as) as any;
}
