import { Prisma, PrismaClient } from "@prisma/client";
import { ApolloServer, gql } from "apollo-server";
import { makeSchema } from "nexus";
import { $settings } from "nexus-prisma";
import { join } from "path";
import * as types from "./types";

const schema = makeSchema({
  types,
  contextType: {
    module: join(__dirname, "types", "context.ts"),
    export: "ContextType",
  },
  outputs: {
    typegen: join(__dirname, "nexus-typegen.ts"), // 2
    schema: join(__dirname, "schema.graphql"), // 3
  },
});

const server = new ApolloServer({
  schema,
  async context(httpContext) {
    // check connection for metadata
    return { db: new PrismaClient() };
  },
});

$settings({
  prismaClientContextField: "db", // <-- Tell Nexus Prisma
});
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
