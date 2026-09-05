    // // ---------------------------------------------------------------------
    // // Template sync
    // // ---------------------------------------------------------------------

    // async syncTemplates(): Promise<void> {
    //     const [cachedHashes, existingAliases] = await Promise.all([
    //         this.getCachedTemplateHashes(),
    //         this.fetchAllTemplateAliases(),
    //     ]);

    //     const templates = Object.values(
    //         EMAIL_TEMPLATES,
    //     ) as EmailTemplateDefinition[];

    //     for (const template of templates) {
    //         const templateHash = this.hashTemplate(template);
    //         const cached = cachedHashes[template.name];

    //         if (cached?.templateHash === templateHash) {
    //             continue;
    //         }

    //         const existsInResend = Boolean(existingAliases[template.alias]);

    //         if (existsInResend) {
    //             await this.updateTemplate(template);
    //             continue;
    //         }

    //         await this.createTemplate(template);

    //         await this.cacheService.setTemplateHash('emailTemplate', {
    //             ...cachedHashes,
    //             [template.name]: {
    //                 alias: template.alias,
    //                 templateHash,
    //             } satisfies TemplateType,
    //         });
    //     }
    // }

    //     private hashTemplate(template: EmailTemplateDefinition): string {
    //     return crypto
    //         .createHash('sha256')
    //         .update(JSON.stringify(template))
    //         .digest('hex');
    // }

    // private async getCachedTemplateHashes(): Promise<
    //     Record<string, TemplateType>
    // > {
    //     const raw = await this.cacheService.getTemplateHash('emailTemplate');
    //     return raw as Record<string, TemplateType>;
    // }

    // private async fetchAllTemplateAliases(): Promise<
    //     Record<string, { alias: string }>
    // > {
    //     const aliasesByName: Record<string, { alias: string }> = {};
    //     let startingAfter: string | undefined;
    //     let hasMore = true;

    //     while (hasMore) {
    //         const page = await withRetry(async () => {
    //             const response = await this.client.templates.list({
    //                 limit: 100,
    //                 ...(startingAfter && { starting_after: startingAfter }),
    //             });
    //             if (response.error)
    //                 throw mapResendErrorResponse(response.error);
    //             return response.data;
    //         }, this.retryOptions);

    //         if (!page) break;

    //         const items = (page.data ?? []) as TemplateListItem[];
    //         for (const item of items) {
    //             if (item.alias) {
    //                 aliasesByName[item.name] = { alias: item.alias };
    //             }
    //         }

    //         hasMore = page.has_more ?? false;
    //         startingAfter =
    //             items.length > 0 ? items[items.length - 1]?.id : undefined;
    //     }

    //     return aliasesByName;
    // }


    //     async createTemplate(payload: CreateTemplateOptions) {
    //     const object: CreateTemplateOptions = {
    //         from: this.defaultFrom,
    //         ...payload,
    //     };

    //     return withRetry(async () => {
    //         const { data, error } = await this.client.templates
    //             .create(object)
    //             .publish();
    //         if (error) throw mapResendErrorResponse(error);
    //         return data;
    //     }, this.retryOptions);
    // }

    // async updateTemplate(payload: UpdateTemplateOptions) {
    //     if (!payload.alias) {
    //         throw new ResendUnknownException(
    //             'updateTemplate requires an alias to identify the template',
    //         );
    //     }

    //     const object: UpdateTemplateOptions = {
    //         from: this.defaultFrom,
    //         ...payload,
    //     };

    //     return withRetry(async () => {
    //         const { data, error } = await this.client.templates.update(
    //             payload.alias!,
    //             object,
    //         );
    //         if (error) throw mapResendErrorResponse(error);
    //         return data;
    //     }, this.retryOptions);
    // }