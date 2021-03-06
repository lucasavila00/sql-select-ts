/**
 *
 * Represents a select statement that was built from a raw string.
 *
 * @since 0.0.3
 */
import { SafeString } from "../safe-string";
import { NoSelectFieldsCompileError, TableOrSubquery } from "../types";
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
export class StringifiedSelectStatement<Selection extends string> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            readonly content: SafeString;
        }
    ) {}

    public static fromSafeString = <NewSelection extends string>(
        content: SafeString
    ): StringifiedSelectStatement<NewSelection> =>
        new StringifiedSelectStatement(
            //
            {
                content,
            }
        );

    /**
     * @since 0.0.3
     */
    public selectStar = (): SelectStatement<Selection, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);

    /**
     * @since 0.0.3
     */
    public select = <
        NewSelection extends string = never,
        SubSelection extends Selection = never
    >(
        f:
            | ReadonlyArray<SubSelection>
            | ((
                  f: Record<Selection, SafeString> & NoSelectFieldsCompileError
              ) => Record<NewSelection, SafeString>)
    ): SelectStatement<Selection, NewSelection | SubSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [
            AliasedRows(consumeRecordCallback(f)),
        ]);

    /**
     * @since 0.0.3
     */
    public commaJoinTable = <
        Alias1 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisQueryAlias: Alias1,
        table: Table<Scope2, Selection2, Alias2>
    ): Joined<
        Selection,
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: thisQueryAlias,
            },
            {
                code: table,
                alias: table.__props.alias,
            },
        ]);

    /**
     * @since 0.0.3
     */
    public joinTable = <
        Alias1 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisQueryAlias: Alias1,
        operator: string,
        table: Table<Scope2, Selection2, Alias2>
    ): JoinedFactory<
        Selection,
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: thisQueryAlias,
                },
            ],
            [],
            {
                code: table,
                alias: table.__props.alias,
                operator,
            }
        );

    /**
     * @since 0.0.3
     */
    public commaJoinStringifiedSelect = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        selectAlias: Alias2,
        select: StringifiedSelectStatement<Selection2>
    ): Joined<
        Selection,
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: thisSelectAlias,
            },
            {
                code: select,
                alias: selectAlias,
            },
        ]);

    /**
     * @since 0.0.3
     */
    public commaJoinSelect = <
        Alias1 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        selectAlias: Alias2,
        select: SelectStatement<Scope2, Selection2>
    ): Joined<
        Selection,
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: thisSelectAlias,
            },
            {
                code: select,
                alias: selectAlias,
            },
        ]);

    /**
     * @since 0.0.3
     */
    public joinStringifiedSelect = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        operator: string,
        selectAlias: Alias2,
        select: StringifiedSelectStatement<Selection2>
    ): JoinedFactory<
        Selection,
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: thisSelectAlias,
                },
            ],
            [],
            {
                code: select,
                alias: selectAlias,
                operator,
            }
        );

    /**
     * @since 0.0.3
     */
    public joinSelect = <
        Alias1 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        operator: string,
        selectAlias: Alias2,
        select: SelectStatement<Scope2, Selection2>
    ): JoinedFactory<
        Selection,
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: thisSelectAlias,
                },
            ],
            [],
            {
                code: select,
                alias: selectAlias,
                operator,
            }
        );

    /**
     * @since 0.0.3
     */
    public commaJoinCompound = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        compoundAlias: Alias2,
        compound: Compound<Selection2, Selection2>
    ): Joined<
        Selection,
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: thisSelectAlias,
            },
            {
                code: compound,
                alias: compoundAlias,
            },
        ]);

    /**
     * @since 0.0.3
     */
    public joinCompound = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        operator: string,
        compoundAlias: Alias2,
        compound: Compound<Selection2, Selection2>
    ): JoinedFactory<
        Selection,
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: thisSelectAlias,
                },
            ],
            [],
            {
                code: compound,
                alias: compoundAlias,
                operator,
            }
        );

    /**
     * @since 1.1.1
     */
    public apply = <Ret extends TableOrSubquery<any, any, any, any> = never>(
        fn: (it: this) => Ret
    ): Ret => fn(this);

    /**
     * @since 0.0.3
     */
    public stringify = (): string => this.__props.content.content;
}
