load("//bzl/hash:rules.bzl", "hashes")
load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test")
load("@rules_python//python:defs.bzl", "py_binary")

def semver_version(name, **kwargs):
    _semver_version(
        name = name,
        output = name + ".txt",
        **kwargs
    )

def _semver_version_impl(ctx):
    ctx.actions.run_shell(
        outputs = [ctx.outputs.output],
        inputs = [
            ctx.file.major,
            ctx.file.minor,
            ctx.file.patch,
        ],
        arguments = [file.path for file in [
            ctx.outputs.output,
            ctx.file.major,
            ctx.file.minor,
            ctx.file.patch,
        ]],
        command = "cat <(echo v) $2 <(echo .) $3 <(echo .) $4 | tr -d '\n' > $1",
        progress_message = "Concatenating version number...",
    )

_semver_version = rule(
    implementation = _semver_version_impl,
    attrs = {
        "major": attr.label(allow_single_file = True, mandatory = True),
        "minor": attr.label(allow_single_file = True, mandatory = True),
        "patch": attr.label(allow_single_file = True, mandatory = True),
        "output": attr.output(mandatory = True),
    },
)

def _absolute_label(label):
    if label.startswith("@") or label.startswith("/"):
        return label
    if label.startswith(":"):
        return native.repository_name() + "//" + native.package_name() + label
    return native.repository_name() + "//" + native.package_name() + ":" + label

def bump_on_change_test(name, srcs = [], version_lock = None, version = None, run_on_main = False):
    tags = []

    if not run_on_main:
        tags = ["do_not_run_on_main"]

    hashes_name = name + "_version_lock_validator"
    hashes(
        name = hashes_name,
        srcs = srcs + [version],
    )

    generated_file_test(
        name = name,
        generated = hashes_name,
        src = version_lock,
        tags = tags + ["version_check"],
    )

    py_binary(
        name = name + ".bump",
        srcs = ["//bzl/versioning:bump.py"],
        main = "//bzl/versioning:bump.py",
        data = [version, hashes_name, version_lock],
        args = [
            "--to_bump_in",
            "$(rootpath " + version + ")",
            "--to_bump_out",
            "$(rootpath " + version + ")",
            "--lockfile_build_label",
            _absolute_label(hashes_name),
            "--lockfile_build_rootpath",
            "$(rootpath " + hashes_name + ")",
            "--lockfile_out_rootpath",
            "$(rootpath " + version_lock + ")",
        ],
    )
