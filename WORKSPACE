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

load("@bazel_features//:deps.bzl", "bazel_features_deps")

bazel_features_deps()

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

load("@com_google_protobuf//:protobuf_deps.bzl", "protobuf_deps")

protobuf_deps()

load("@rules_rust//rust:repositories.bzl", "rules_rust_dependencies", "rust_register_toolchains")

rules_rust_dependencies()

rust_register_toolchains(edition = "2021")

# this rule is really weird. see docs https://github.com/bazelbuild/rules_rust/blob/main/crate_universe/private/crates_repository.bzl#L137
load("@rules_rust//crate_universe:defs.bzl", "crates_repository")

# renovate:
# 	datasource=github-releases
# 	versioning=rust
# 	depName=rust-lang/rust
RUST_VERSION = "1.83.0"

crates_repository(
    name = "cargo",
    cargo_lockfile = "//:Cargo.Bazel.lock",
    generate_binaries = True,
    lockfile = "//:cargo-bazel-lock.json",
    manifests = ["//:Cargo.toml"],
    # Should match the version represented by the currently registered `rust_toolchain`.
    rust_version = RUST_VERSION,
)

load("@cargo//:defs.bzl", "crate_repositories")

crate_repositories()

load("@rules_rust//tools/rust_analyzer:deps.bzl", "rust_analyzer_dependencies")

rust_analyzer_dependencies()

load("@aspect_bazel_lib//lib:repositories.bzl", "register_copy_directory_toolchains", "register_copy_to_directory_toolchains", "register_coreutils_toolchains")

register_coreutils_toolchains()

register_copy_directory_toolchains()

register_copy_to_directory_toolchains()

# ruff is a special snowflake because it's a pip package that
# is actually a rust binary, and the rust binary is not on
# cargo for some reason.
load("@aspect_rules_lint//lint:ruff.bzl", "fetch_ruff")

fetch_ruff()
