export interface GlueNode {
    children: GlueNode[];
    element?: Element;
    i: number;
    key: string;
    name: string;
    lifecycle: string;
    prev: {
        props: any;
    };
    props: any;
}
