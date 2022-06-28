import {
    SafeString,
    sql as _sql,
    table as _table,
    unionAll as _unionAll,
    castSafe as _castSafe,
    fromNothing as _fromNothing,
} from "../../lib/src";

const table = _table;
const sql = _sql;
const unionAll = _unionAll;
const castSafe = _castSafe;
const fromNothing = _fromNothing;

const users = table(
    /* columns: */ ["id", "age", "name"],
    /* db-name & alias: */ "users"
);

const admins = table(
    /* columns: */ ["id", "age", "name"],
    /* alias: */ "adm",
    /* db-name: */ "admins"
);

const analytics = table(
    /* columns: */ ["id", "clicks"],
    /* db-name & alias: */ "analytics"
);
const equals = (
    a: SafeString | number | string,
    b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;

function* generator() {
    yield users
        .joinTable("LEFT", admins)
        .on((f) => equals(f["adm.id"], f["users.id"]))
        .selectStar()
        .stringify();
    yield admins
        .joinSelect("u", "LEFT", users.selectStar())
        .on((f) => equals(f["u.id"], f["adm.id"]))
        .selectStar()
        .stringify();
    yield users
        .joinTable("LEFT", admins)
        .on((f) => equals(f["adm.id"], f["users.id"]))
        .joinTable("LEFT", analytics)
        .on((f) => equals(f["analytics.id"], f["users.id"]))
        .selectStar()
        .stringify();
    const userAndAdmin = users
        .selectStar()
        .joinSelect("users", "LEFT", "admins", admins.selectStar())
        .on((f) => equals(f["admins.id"], f["users.id"]));

    const userAdminAnalytics = userAndAdmin
        .joinSelect("LEFT", "analytics", analytics.selectStar())
        .on((f) => equals(f["analytics.id"], f["users.id"]));

    yield userAdminAnalytics.selectStar().stringify();
}
const gen = generator(); // "Generator { }"

console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // 3
