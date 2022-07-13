import { Table } from "../../src/classes/table";
import { format } from "sql-formatter";
import { dsql, unionAll } from "../../src";

const t = Table.define(["id", "name"], "users");
it("select star", () => {
    expect(t.selectStar().stringify()).toMatchInlineSnapshot(
        `"SELECT * FROM \`users\`"`
    );
    expect(
        t
            .selectStar()
            .select((f) => ({ abc: f.name }))
            .stringify()
    ).toMatchInlineSnapshot(
        `"SELECT \`name\` AS \`abc\` FROM (SELECT * FROM \`users\`)"`
    );

    expect(
        t
            .selectStar("t1a")
            .select((f) => ({ abc: f.t1a.name }))
            .stringify()
    ).toMatchInlineSnapshot(
        `"SELECT \`t1a\`.\`name\` AS \`abc\` FROM (SELECT * FROM \`users\`) AS \`t1a\`"`
    );

    expect(
        format(
            t
                .selectStar("t1a")
                .selectStar("t2a")
                .select((f) => ({ abc: f.t2a.name }))
                .stringify()
        )
    ).toMatchInlineSnapshot(`
        "SELECT
          \`t2a\`.\`name\` AS \`abc\`
        FROM
          (
            SELECT
              *
            FROM
              (
                SELECT
                  *
                FROM
                  \`users\`
              ) AS \`t1a\`
          ) AS \`t2a\`"
    `);
});
it("select qualified", () => {
    expect(t.__props.scope).toMatchInlineSnapshot(`
        Object {
          "users": undefined,
        }
    `);
    const query1 = t.select((f) => ({
        abc: f.id,
        def: f.users.id,
    }));

    expect(query1.__props.scope).toMatchInlineSnapshot(`Object {}`);
    expect(query1.__props.selection).toMatchInlineSnapshot(`
        Array [
          Object {
            "_tag": "AliasedRows",
            "content": Object {
              "abc": Object {
                "_tag": "SafeString",
                "content": "\`id\`",
              },
              "def": Object {
                "_tag": "SafeString",
                "content": "\`users\`.\`id\`",
              },
            },
          },
        ]
    `);
    expect(query1.stringify()).toMatchInlineSnapshot(
        `"SELECT \`id\` AS \`abc\`, \`users\`.\`id\` AS \`def\` FROM \`users\`"`
    );
    const query2 = t.select(["id"]);

    expect(query2.__props.scope).toMatchInlineSnapshot(`Object {}`);
    expect(query2.__props.selection).toMatchInlineSnapshot(`
        Array [
          Object {
            "_tag": "AliasedRows",
            "content": Object {
              "id": Object {
                "_tag": "SafeString",
                "content": "\`id\`",
              },
            },
          },
        ]
    `);
    expect(query2.stringify()).toMatchInlineSnapshot(
        `"SELECT \`id\` AS \`id\` FROM \`users\`"`
    );
});

it("type checks", () => {
    t.select((f) => ({
        //@ts-expect-error
        abc: f.id2,
        //@ts-expect-error
        def: f.users.id2,
    }));
    //@ts-expect-error
    t.select(["id2"]);
    expect(1).toBe(1);
});

it("append select", () => {
    t.select((f) => ({
        abc: f.id,
        def: f.users.id,
    })).appendSelect((f) => ({ y: f.users.name }));
    expect(1).toBe(1);
});

it("query alias", () => {
    const r1 = t.select(
        (f) => ({
            abc: f.id,
            def: f.users.id,
        }),
        "alias2"
    );
    expect(r1.__props.scope).toMatchInlineSnapshot(`
        Object {
          "alias2": undefined,
        }
    `);
    expect(format(r1.stringify())).toMatchInlineSnapshot(`
        "SELECT
          \`id\` AS \`abc\`,
          \`users\`.\`id\` AS \`def\`
        FROM
          \`users\`"
    `);
    const r2 = r1.select((f) => ({ col1: f.abc, col2: f.alias2.def }));

    expect(r2.__props.scope).toMatchInlineSnapshot(`Object {}`);
    expect(r2.__props.selection).toMatchInlineSnapshot(`
        Array [
          Object {
            "_tag": "AliasedRows",
            "content": Object {
              "col1": Object {
                "_tag": "SafeString",
                "content": "\`abc\`",
              },
              "col2": Object {
                "_tag": "SafeString",
                "content": "\`alias2\`.\`def\`",
              },
            },
          },
        ]
    `);
    expect(format(r2.stringify())).toMatchInlineSnapshot(`
        "SELECT
          \`abc\` AS \`col1\`,
          \`alias2\`.\`def\` AS \`col2\`
        FROM
          (
            SELECT
              \`id\` AS \`abc\`,
              \`users\`.\`id\` AS \`def\`
            FROM
              \`users\`
          ) AS \`alias2\`"
    `);
});

it("query alias type checks", () => {
    const r1 = t.select((f) => ({
        abc: f.id,
        def: f.users.id,
    }));

    r1.select((f) => ({
        col1: f.abc,
        col2:
            //@ts-expect-error
            f.alias2.def,
    }));

    expect(1).toBe(1);
});

it("join using", () => {
    const query1 = t
        .select(
            (f) => ({
                id: f.id,
                def: f.users.id,
            }),
            "q1"
        )
        .join("LEFT", t)
        .using(["id"])
        .select((f) => ({ abc: f.q1.def, x2: f.users.name }))
        .stringify();

    expect(format(query1)).toMatchInlineSnapshot(`
        "SELECT
          \`q1\`.\`def\` AS \`abc\`,
          \`users\`.\`name\` AS \`x2\`
        FROM
          (
            SELECT
              \`id\` AS \`id\`,
              \`users\`.\`id\` AS \`def\`
            FROM
              \`users\`
          ) AS \`q1\`
          LEFT JOIN \`users\` USING(\`id\`)"
    `);
});

it("join then select", () => {
    const query1 = t
        .select(
            (f) => ({
                id: f.id,
                def: f.users.id,
            }),
            "q1"
        )
        .join("LEFT", t)
        .using(["id"])
        .select((f) => ({ abc: f.q1.def, x2: f.name }))
        .stringify();

    expect(format(query1)).toMatchInlineSnapshot(`
        "SELECT
          \`q1\`.\`def\` AS \`abc\`,
          \`name\` AS \`x2\`
        FROM
          (
            SELECT
              \`id\` AS \`id\`,
              \`users\`.\`id\` AS \`def\`
            FROM
              \`users\`
          ) AS \`q1\`
          LEFT JOIN \`users\` USING(\`id\`)"
    `);
});

it("join using type checks", () => {
    t.select(
        (f) => ({
            id: f.id,
            def: f.users.id,
        }),
        "q1"
    )
        .join("LEFT", t)
        //@ts-expect-error
        .using(["name"]);

    expect(1).toBe(1);
});
it("join on", () => {
    const query1 = t
        .select(
            (f) => ({
                id: f.id,
                def: f.users.id,
            }),
            "q1"
        )
        .join("LEFT", t)
        .on((f) => [dsql`${f.q1.def} = ${f.name}`])
        .select((f) => ({ abc: f.def }))
        .stringify();

    expect(format(query1)).toMatchInlineSnapshot(`
        "SELECT
          \`def\` AS \`abc\`
        FROM
          (
            SELECT
              \`id\` AS \`id\`,
              \`users\`.\`id\` AS \`def\`
            FROM
              \`users\`
          ) AS \`q1\`
          LEFT JOIN \`users\` ON \`q1\`.\`def\` = \`name\`"
    `);
});

it("join on 2 queries", () => {
    const query1 = t
        .select(
            (f) => ({
                id: f.id,
                def: f.users.id,
            }),
            "q1"
        )
        .join(
            "LEFT",
            t.select((f) => ({ name: f.name }), "a2")
        )
        .on((f) => [
            dsql`${f.q1.def} = ${f.name}`,
            dsql`${f.q1.def} = ${f.a2.name}`,
        ])
        .select((f) => ({ abc: f.def }))
        .stringify();

    expect(format(query1)).toMatchInlineSnapshot(`
        "SELECT
          \`def\` AS \`abc\`
        FROM
          (
            SELECT
              \`id\` AS \`id\`,
              \`users\`.\`id\` AS \`def\`
            FROM
              \`users\`
          ) AS \`q1\`
          LEFT JOIN (
            SELECT
              \`name\` AS \`name\`
            FROM
              \`users\`
          ) AS \`a2\` ON \`q1\`.\`def\` = \`name\`
          AND \`q1\`.\`def\` = \`a2\`.\`name\`"
    `);
});

it("join on 2 tables", () => {
    const t2 = Table.define(["id", "name"], "users2");
    const query1 = t

        .join("LEFT", t2)
        .on((f) => [
            dsql`${f.users.id} = ${f.users2.id}`,
            dsql`${f.id} = ${f.name}`,
        ])
        .select((f) => ({ abc: f.users.id }))
        .stringify();

    expect(format(query1)).toMatchInlineSnapshot(`
        "SELECT
          \`users\`.\`id\` AS \`abc\`
        FROM
          \`users\`
          LEFT JOIN \`users2\` ON \`users\`.\`id\` = \`users2\`.\`id\`
          AND \`id\` = \`name\`"
    `);
});

it("join on 2 tables and select star", () => {
    const t2 = Table.define(["id", "name"], "users2");
    const query1 = t

        .join("LEFT", t2)
        .on((f) => [
            dsql`${f.users.id} = ${f.users2.id}`,
            dsql`${f.id} = ${f.name}`,
        ])
        .selectStar()
        .select((f) => ({ r3: f.name }))
        .select((f) => ({ f4: f.r3 }))
        .stringify();

    expect(format(query1)).toMatchInlineSnapshot(`
        "SELECT
          \`r3\` AS \`f4\`
        FROM
          (
            SELECT
              \`name\` AS \`r3\`
            FROM
              (
                SELECT
                  *
                FROM
                  \`users\`
                  LEFT JOIN \`users2\` ON \`users\`.\`id\` = \`users2\`.\`id\`
                  AND \`id\` = \`name\`
              )
          )"
    `);
});
it("join on 3 tables", () => {
    const t2 = Table.define(["id", "name"], "users2");
    const t3 = Table.define(["id", "name"], "users3");
    const query1 = t

        .join("LEFT", t2)
        .on((f) => [
            dsql`${f.users.id} = ${f.users2.id}`,
            dsql`${f.id} = ${f.name}`,
        ])
        .join("RIGHT", t3)
        .on((f) => [dsql`${f.users3.id} = ${f.users2.name}`])
        .select((f) => ({ abc: f.users.id }))
        .stringify();

    expect(format(query1)).toMatchInlineSnapshot(`
        "SELECT
          \`users\`.\`id\` AS \`abc\`
        FROM
          \`users\`
          LEFT JOIN \`users2\` ON \`users\`.\`id\` = \`users2\`.\`id\`
          AND \`id\` = \`name\`
          RIGHT JOIN \`users3\` ON \`users3\`.\`id\` = \`users2\`.\`name\`"
    `);
});

it("union", () => {
    const t2 = Table.define(["id", "name"], "users2").selectStar();
    const t3 = Table.define(["id", "name"], "users3").selectStar();
    const query1 = unionAll([t2, t3]);

    expect(format(query1.stringify())).toMatchInlineSnapshot(`
        "SELECT
          *
        FROM
          \`users2\`
        UNION ALL
        SELECT
          *
        FROM
          \`users3\`"
    `);
});

it("union and select", () => {
    const t2 = Table.define(["id", "name"], "users2").selectStar();
    const t3 = Table.define(["id3", "name3"], "users3").selectStar();
    const query1 = unionAll([t2, t3])
        .select((f) => ({ x: f.id, y: f.name3 }))
        .stringify();

    expect(format(query1)).toMatchInlineSnapshot(`
        "SELECT
          \`id\` AS \`x\`,
          \`name3\` AS \`y\`
        FROM
          (
            SELECT
              *
            FROM
              \`users2\`
            UNION ALL
            SELECT
              *
            FROM
              \`users3\`
          )"
    `);
});
it("union and select star", () => {
    const t2 = Table.define(["id", "name"], "users2").selectStar();
    const t3 = Table.define(["id3", "name3"], "users3").selectStar();
    const query1 = unionAll([t2, t3])
        .selectStar()
        .select((f) => ({ abc: f.id }))
        .stringify();

    expect(format(query1)).toMatchInlineSnapshot(`
        "SELECT
          \`id\` AS \`abc\`
        FROM
          (
            SELECT
              *
            FROM
              (
                SELECT
                  *
                FROM
                  \`users2\`
                UNION ALL
                SELECT
                  *
                FROM
                  \`users3\`
              )
          )"
    `);
});
