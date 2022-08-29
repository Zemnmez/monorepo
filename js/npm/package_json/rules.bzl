load("//:rules.bzl", "nodejs_binary")

def package_json(name, targets, template, version):
    """
    Generate a package.json for a given target.
    """
    query_expression = "deps(" + ", ".join([str(Label("//" + native.package_name()).relative(target)) for target in targets]) + ", 1)"
    genquery_name = name + "_deps"
    native.genquery(
        name = genquery_name,
        scope = targets,
        expression = query_expression,
    )

    genrule_name = name + "_gen"
    nodejs_binary(
        name = genrule_name,
        data = [
            "//:package.json",
            genquery_name,
            template,
            "//js/npm/package_json:gen_pkgjson",
        ],
        entry_point = "//js/npm/package_json:gen_pkgjson.js",
    )

    native.genrule(
        name = name,
        srcs = [
            "@npm//commander",
            "//:package.json",
            genquery_name,
            template,
            "@npm//@bazel/runfiles",
            "//js/npm/package_json:gen_pkgjson",
        ] + [version],
        cmd = "$(execpath " + genrule_name + ") " +
              " ".join(
                  [
                      "--out",
                      "$@",
                      "--base",
                      "$(location //:package.json)",
                      "--query",
                      "$(location " + genquery_name + ")",
                      "--merge",
                      "$(location " + template + ")",
                      "--version",
                      "$(location " + version + ")",
                      "--package_name",
                      native.package_name(),
                  ],
              ),
        outs = ["package.json"],
        tools = [genrule_name],
    )
