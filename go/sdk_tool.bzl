"""
Taken from https://github.com/buildbuddy-io/buildbuddy/blob/0e46543c957fa3fc2341151b5ca632408a3c06b2/rules/go/index.bzl

Thank you BuildBuddy!

Used to address https://github.com/bazelbuild/rules_go/issues/511
"""

load("@bazel_skylib//lib:paths.bzl", "paths")
load("@io_bazel_rules_go//go:def.bzl", "go_context")

def _go_sdk_tool_impl(ctx):
    # Locate the File object corresponding to the tool path. This is needed for
    # bazel to be able to create an executable symlink to that tool and to be
    # able to recreate the symlink if the tool changes.
    go = go_context(ctx)
    tool_path = paths.join(go.sdk_root.dirname, ctx.attr.goroot_relative_path)
    tool = None

    sdk_tools = []
    sdk_tools.append(go.go)  # `go` binary
    sdk_tools.extend(go.sdk_tools.to_list())  # all other tools, e.g. `gofmt`

    for f in sdk_tools:
        if f.path == tool_path:
            tool = f
            break
    if not tool:
        fail("could not locate SDK tool '%s'" % tool_path)

    # Declare an executable symlink to the tool File.
    tool_symlink = ctx.actions.declare_file(ctx.attr.name)
    ctx.actions.symlink(output = tool_symlink, target_file = tool, is_executable = True)

    return [DefaultInfo(
        files = depset([tool_symlink]),
        runfiles = ctx.runfiles(files = [tool_symlink]),
        executable = tool_symlink,
    )]

go_sdk_tool = rule(
    doc = "Declares a run target from the go SDK.",
    attrs = {
        "goroot_relative_path": attr.string(mandatory = True, doc = "Tool path relative to the go SDK root (GOROOT)"),
        "_go_context_data": attr.label(
            default = "@io_bazel_rules_go//:go_context_data",
        ),
    },
    implementation = _go_sdk_tool_impl,
    executable = True,
    toolchains = ["@io_bazel_rules_go//go:toolchain"],
)
