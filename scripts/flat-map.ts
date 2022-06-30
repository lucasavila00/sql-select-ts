import { Data, Node, Parent } from "unist";

export const flatMap = (
    ast: Parent,
    fn: (
        it: Parent,
        index: number,
        parent: Parent | null
    ) => (Parent | Node<Data>)[]
): Node<Data> => {
    const transform = (node: Parent, index: number, parent: Parent | null) => {
        if (node.children) {
            const out: (Node<Data> | Parent<Node<Data>, Data>)[] = [];
            for (let i = 0, n = node.children.length; i < n; i++) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                const xs = transform(node.children[i], i, node);
                if (xs) {
                    for (let j = 0, m = xs.length; j < m; j++) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore
                        out.push(xs[j]);
                    }
                }
            }
            node.children = out;
        }

        return fn(node, index, parent);
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return transform(ast, 0, null)[0];
};
