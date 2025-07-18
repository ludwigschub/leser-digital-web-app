import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: "https://localhost:4000/graphql",
  documents: ["src/**/*.graphql"],
  generates: {
    "./src/graphql/": {
      preset: "client",
    },
  },
}
export default config
