export type TemplateApiQueryValue = string | number | boolean | Date | null | undefined

export type TemplateApiRequestParams = Record<string, TemplateApiQueryValue | TemplateApiQueryValue[]>
