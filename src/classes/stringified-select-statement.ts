/**
 *
 * Represents a select statement that was built from a raw string.
 *
 * @since 2.0.0
 */
import { StarSymbol } from "../data-wrappers";
import { SafeString } from "../safe-string";
import {
    Fields,
    Joinable,
    NoSelectFieldsCompileError,
    ScopeStorage,
    SelectionRecord,
    TableOrSubquery,
} from "../types";
import { Joined, JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";

/**
 *
 * Represents a select statement that was built from a raw string.
 *
 * @since 2.0.0
 */
export class StringifiedSelectStatement {
    /* @internal */
    protected constructor(
        /* @internal */
        public __props: {
            readonly content: SafeString;
            readonly printWrapped: boolean;
            readonly scope: ScopeStorage;
            readonly alias?: string;
        }
    ) {}

    public static fromSafeString = (
        content: SafeString,
        printWrapped = true
    ): StringifiedSelectStatement =>
        new StringifiedSelectStatement(
            //
            {
                content,
                printWrapped,
                scope: {},
            }
        );

    /**
     * @since 2.0.0
     */
    public selectStar = (): SelectStatement =>
        SelectStatement.__fromTableOrSubqueryAndSelectionArray(
            this,
            [StarSymbol()],
            this.__props.scope,
            undefined
        );

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
            this.__props.scope,
            undefined
        );

    /**
     * @since 2.0.0
     */
    public apply = <Ret extends TableOrSubquery = TableOrSubquery>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    /**
     * @since 2.0.0
     */
    public as = (as: string): AliasedStringifiedSelectStatement =>
        new AliasedStringifiedSelectStatement(this.__props).__setAlias(
            as
        ) as any;

    /**
     * @since 2.0.0
     */
    public stringify = (): string => this.__props.content.content;
}

/**
 * @since 2.0.0
 */
export class AliasedStringifiedSelectStatement extends StringifiedSelectStatement {
    private __copy = (): AliasedStringifiedSelectStatement =>
        new AliasedStringifiedSelectStatement({ ...this.__props });

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
    public as = (as: string): AliasedStringifiedSelectStatement =>
        this.__copy().__setAlias(as) as any;
}
