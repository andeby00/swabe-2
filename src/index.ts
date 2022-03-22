import { ApolloServer, gql } from "apollo-server";
import { makeSchema } from "nexus";
import { join } from "path";
import * as types from "./types";

const schema = makeSchema({
  types,
  // contextType: {
  //   module: join(__dirname, "types", "context.ts"),
  //   export: "ContextType",
  // },
  outputs: {
    typegen: join(__dirname, "nexus-typegen.ts"), // 2
    schema: join(__dirname, "schema.graphql"), // 3
  },
});

// $settings({
//   prismaClientContextField: 'db', // <-- Tell Nexus Prisma
// });
const server = new ApolloServer({ schema });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
