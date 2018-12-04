export interface GlueNode {
    children: GlueNode[];
    element?: Element | Node;
    i: number;
    key: string;
    name: string;
    lifecycle: string;
    prev: {
        props: any;
    };
    props: any;
}
