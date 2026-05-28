namespace BiBackend.Exceptions;

public class BiException : Exception
{
    public BiException(string message) : base(message) { }
    public BiException(string message, Exception? cause) : base(message, cause) { }
}

public sealed class MdxExecutionException : BiException
{
    public string Mdx { get; }

    public MdxExecutionException(string message, string mdx, Exception? cause)
        : base(message, cause)
    {
        Mdx = mdx;
    }
}
