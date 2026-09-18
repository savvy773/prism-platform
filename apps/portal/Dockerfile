FROM node:24.21.0-bookworm-slim
ENV PNPM_HOME=/pnpm NEXT_TELEMETRY_DISABLED=1
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global pnpm@12.4.2 && mkdir -p /workspace /pnpm && chown node:node /workspace /pnpm
WORKDIR /workspace
COPY --chown=node:node package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY --chown=node:node apps/portal/package.json apps/portal/package.json
COPY --chown=node:node packages/ui/package.json packages/ui/package.json
COPY --chown=node:node packages/config/package.json packages/config/package.json
USER node
RUN pnpm install --frozen-lockfile
COPY --chown=node:node apps/portal apps/portal
COPY --chown=node:node packages packages
EXPOSE 3000
CMD ["pnpm", "--filter", "@prism/portal", "dev"]
