interface CardParams {
    title: string;
    value: string;
    decorationClass?: string;
    subtitle: string;
}

const Card = (params: CardParams) => {
    return (
        <div className="bg-surface-1 p-5 rounded-lg flex flex-col border border-border">
            <span className="text-xs mb-3 tracking-wider uppercase text-text-dim">
                {params.title}
            </span>
            <span
                className={
                    "text-2xl font-medium mb-2 " + params.decorationClass
                }
            >
                {params.value}
            </span>

            <span className="text-xs text-text-muted">{params.subtitle}</span>
        </div>
    );
};

export default Card;
