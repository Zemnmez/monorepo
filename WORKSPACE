# Bazel workspace created by @bazel/create 3.7.0

# Needed by Protobuf
bind(
    name = "python_headers",
    actual = "@com_google_protobuf//:protobuf_headers",
)

# Declares that this directory is the root of a Bazel workspace.
# See https://docs.bazel.build/versions/master/build-ref.html#workspace
workspace(
    # How this workspace would be referenced with absolute labels from another workspace
    name = "monorepo",
)

load("//bzl:deps.bzl", "fetch_dependencies")

fetch_dependencies()

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

load("@rules_python//python:repositories.bzl", "python_register_toolchains")

python_register_toolchains(
    name = "python3_9",
    # Available versions are listed in @rules_python//python:versions.bzl.
    # We recommend using the same version your team is already standardized on.
    python_version = "3.9",
)

load("@python3_9//:defs.bzl", "interpreter")
load("@rules_python//python:pip.bzl", "pip_parse")

pip_parse(
    name = "pip",
    python_interpreter_target = interpreter,
    # pip-compile
    requirements_lock = "//:requirements.txt",
)

load("@pip//:requirements.bzl", "install_deps")

install_deps()

load("@io_bazel_rules_go//go:deps.bzl", "go_register_toolchains", "go_rules_dependencies")

go_rules_dependencies()

go_register_toolchains(version = "1.17.2")

load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")

rules_proto_dependencies()

rules_proto_toolchains()

load("@bazel_gazelle//:deps.bzl", "gazelle_dependencies")

# If you use WORKSPACE.bazel, use the following line instead of the bare gazelle_dependencies():
# gazelle_dependencies(go_repository_default_config = "@//:WORKSPACE.bazel")
gazelle_dependencies()

load("@com_google_protobuf//:protobuf_deps.bzl", "protobuf_deps")

protobuf_deps()

load("@rules_rust//rust:repositories.bzl", "rules_rust_dependencies", "rust_register_toolchains")

rules_rust_dependencies()

rust_register_toolchains(edition = "2021")

# this rule is really weird. see docs https://github.com/bazelbuild/rules_rust/blob/main/crate_universe/private/crates_repository.bzl#L137
load("@rules_rust//crate_universe:defs.bzl", "crate", "crates_repository")

crates_repository(
    name = "cargo",
    cargo_lockfile = "//:Cargo.Bazel.lock",
    lockfile = "//:cargo-bazel-lock.json",
    manifests = ["//:Cargo.toml"],
    # Should match the version represented by the currently registered `rust_toolchain`.
    rust_version = "1.60.0",
)

load("@cargo//:defs.bzl", "crate_repositories")

crate_repositories()

load("@rules_rust//tools/rust_analyzer:deps.bzl", "rust_analyzer_dependencies")

rust_analyzer_dependencies()

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

load("@rules_nodejs//nodejs:repositories.bzl", "DEFAULT_NODE_VERSION", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_version = DEFAULT_NODE_VERSION,
)

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm",
    npmrc = "//:.npmrc",
    pnpm_lock = "//:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.bazelignore",
)

load("@npm//:repositories.bzl", "npm_repositories")

npm_repositories()

# https://github.com/Zemnmez/rules_js/blob/bdf3d5a61c6af9e5d7d584cfe5f78f42d1e3f227/docs/faq.md#can-i-use-bazel-managed-pnpm
load("@aspect_rules_js//npm:npm_import.bzl", "pnpm_repository")

pnpm_repository(name = "pnpm")

##################
# rules_ts setup #
##################
# Fetches the rules_ts dependencies.
# If you want to have a different version of some dependency,
# you should fetch it *before* calling this.
# Alternatively, you can skip calling this function, so long as you've
# already fetched all the dependencies.
load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

rules_ts_dependencies(
    # This keeps the TypeScript version in-sync with the editor, which is typically best.
    ts_version_from = "//:package.json",

    # Alternatively, you could pick a specific version, or use
    # load("@aspect_rules_ts//ts:repositories.bzl", "LATEST_VERSION")
    # ts_version = LATEST_VERSION

    # HEAD is currently further along than rules_ts has patches for.
    # this will break updates to typescript, so should probably be removed when
    # rules_ts is updated.
    ts_integrity = "sha512-wVORMBGO/FAs/++blGNeAVdbNKtIh1rbBL2EyQ1+J9lClJ93KiiKe8PmFIVdXhHcyv44SL9oglmfeSsndo0jRw=="
)

# Fetch and register node, if you haven't already
load("@rules_nodejs//nodejs:repositories.bzl", "DEFAULT_NODE_VERSION", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "node",
    node_version = DEFAULT_NODE_VERSION,
)

# Register aspect_bazel_lib toolchains;
# If you use npm_translate_lock or npm_import from aspect_rules_js you can omit this block.
load("@aspect_bazel_lib//lib:repositories.bzl", "register_copy_directory_toolchains", "register_copy_to_directory_toolchains")

register_copy_directory_toolchains()

register_copy_to_directory_toolchains()

###################
# rules_swc setup #
###################

# Fetches the rules_swc dependencies.
# If you want to have a different version of some dependency,
# you should fetch it *before* calling this.
# Alternatively, you can skip calling this function, so long as you've
# already fetched all the dependencies.
load("@aspect_rules_swc//swc:dependencies.bzl", "rules_swc_dependencies")

rules_swc_dependencies()

# Fetches a SWC cli from
# https://github.com/swc-project/swc/releases
# If you'd rather compile it from source, you can use rules_rust, fetch the project,
# then register the toolchain yourself. (Note, this is not yet documented)
load("@aspect_rules_swc//swc:repositories.bzl", "LATEST_VERSION", "swc_register_toolchains")

swc_register_toolchains(
    name = "swc",
    swc_version = LATEST_VERSION,
)
