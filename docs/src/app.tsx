import React, { useEffect } from "react";
import { table as _table } from "../../src";

import useSWR from "swr";

const table = _table;
console.error(table);
export function App() {
    const contentURL = new URL("../content/q.md", import.meta.url).toString();
    const { data } = useSWR(contentURL, (str) =>
        fetch(str).then((it) => it.text())
    );

    if (data == null) {
        return <></>;
    }

    return (
        <>
            <pre>{data}</pre>
            <br />
            <pre>{eval(data)}</pre>
        </>
    );
}
