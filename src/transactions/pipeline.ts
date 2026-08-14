/** The only required shape for a pipeline context; applications may extend it. */
export interface PipelineContext {
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface TransactionPipelineStage<
  TInput extends PipelineContext,
  TOutput extends PipelineContext,
> {
  readonly name: string;
  execute(context: TInput): Promise<TOutput>;
}

/**
 * A typed, immutable stage list. There is deliberately no mandatory ordering:
 * callers compose only the stages their transaction type needs.
 */
export class TransactionPipeline<
  TInitial extends PipelineContext,
  TContext extends PipelineContext = TInitial,
> {
  private constructor(
    private readonly stages: readonly TransactionPipelineStage<any, any>[] = []
  ) {}

  static create<TContext extends PipelineContext>(): TransactionPipeline<TContext> {
    return new TransactionPipeline<TContext>();
  }

  use<TNext extends PipelineContext>(
    stage: TransactionPipelineStage<TContext, TNext>
  ): TransactionPipeline<TInitial, TNext> {
    return new TransactionPipeline<TInitial, TNext>([...this.stages, stage]);
  }

  async run(initial: TInitial): Promise<TContext> {
    let context: PipelineContext = initial;
    for (const stage of this.stages) {
      context = await stage.execute(context);
    }
    return context as TContext;
  }
}
