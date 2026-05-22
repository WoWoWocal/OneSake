using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OneSake.Game.State;

public sealed record CardInstance
{
    public string InstanceId { get; init; } = string.Empty;

    public string CardId { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;
}
