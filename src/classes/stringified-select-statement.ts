/**
 *
 * Represents a select statement that was built from a raw string.
 *
 * @since 0.0.3
 */
import { SafeString } from "../safe-string";
import {
    NoSelectFieldsCompileError,
    ScopeStorage,
    TableOrSubquery,
} from "../types";
import { Compound } from "./compound";
import { Joined, JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";
import { Table } from "./table";
import { AliasedRows, StarSymbol } from "../data-wrappers";
import { consumeRecordCallback } from "../consume-fields";

/**
 *
 * Represents a select statement that was built from a raw string.
 *
 * @since 0.0.3
 */
export class StringifiedSelectStatement<
    Selection extends string = never,
    Alias extends string = never,
    Scope extends ScopeShape = never
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            readonly content: SafeString;
            readonly scope: ScopeStorage;
        }
    ) {}

    public static fromSafeString = <
        NewSelection extends string = never,
        NewAlias extends string = never
    >(
        content: SafeString
    ): StringifiedSelectStatement<NewSelection, NewAlias, never> =>
        new StringifiedSelectStatement(
            //
            {
                content,
                scope: {},
            }
        );

    //     /**
    //      * @since 0.0.3
    //      */
    //     public selectStar = (): SelectStatement<Selection, Selection> =>
    //         SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);

    //     /**
    //      * @since 0.0.3
    //      */
    //     public select = <
    //         NewSelection extends string = never,
    //         SubSelection extends Selection = never
    //     >(
    //         f:
    //             | ReadonlyArray<SubSelection>
    //             | ((
    //                   f: Record<Selection, SafeString> & NoSelectFieldsCompileError
    //               ) => Record<NewSelection, SafeString>)
    //     ): SelectStatement<Selection, NewSelection | SubSelection> =>
    //         SelectStatement.__fromTableOrSubquery(this, [
    //             AliasedRows(consumeRecordCallback(f)),
    //         ]);
    //    /**
    //      * @since 0.0.3
    //      */
    //     public joinTable = <
    //         Alias1 extends string,
    //         Scope2 extends string,
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         thisQueryAlias: Alias1,
    //         operator: string,
    //         table: Table<Scope2, Selection2, Alias2>
    //     ): JoinedFactory<
    //         Selection,
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias1}.${Selection}`
    //         | `${Alias2}.${Selection2}`,
    //         Alias1 | Alias2,
    //         Extract<Selection2, Selection>
    //     > =>
    //         JoinedFactory.__fromAll(
    //             [
    //                 {
    //                     code: this,
    //                     alias: thisQueryAlias,
    //                 },
    //             ],
    //             [],
    //             {
    //                 code: table,
    //                 alias: table.__props.alias,
    //                 operator,
    //             }
    //         );
    //     /**
    //      * @since 0.0.3
    //      */
    //     public commaJoinTable = <
    //         Alias1 extends string,
    //         Scope2 extends string,
    //         Selection2 extends string,
    //         Alias2 extends string
    //     >(
    //         thisQueryAlias: Alias1,
    //         table: Table<Scope2, Selection2, Alias2>
    //     ): Joined<
    //         Selection,
    //         | Exclude<Selection, Selection2>
    //         | Exclude<Selection2, Selection>
    //         | `${Alias1}.${Selection}`,
    //         Alias1 | Alias2
    //     > =>
    //         Joined.__fromCommaJoin([
    //             {
    //                 code: this,
    //                 alias: thisQueryAlias,
    //             },
    //             {
    //                 code: table,
    //                 alias: table.__props.alias,
    //             },
    //         ]);

    /**
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    /**
     * @since 0.0.3
     */
    public stringify = (): string => this.__props.content.content;
}
