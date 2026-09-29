import type {StructureResolver} from 'sanity/structure'

// Editors think in countries and in "what can go wrong", so the desk is
// grouped that way instead of one long list per type.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Drum Bun')
    .items([
      S.listItem()
        .title('By country')
        .child(
          S.documentTypeList('country')
            .title('Countries')
            .child((countryId) =>
              S.list()
                .title('Country')
                .items([
                  S.listItem()
                    .title('Toll products')
                    .child(
                      S.documentList()
                        .title('Toll products')
                        .schemaType('tollProduct')
                        .filter('_type == "tollProduct" && country._ref == $countryId')
                        .params({countryId}),
                    ),
                  S.listItem()
                    .title('Road sections')
                    .child(
                      S.documentList()
                        .title('Road sections')
                        .schemaType('roadSection')
                        .filter('_type == "roadSection" && country._ref == $countryId')
                        .params({countryId}),
                    ),
                  S.listItem()
                    .title('Rules')
                    .child(
                      S.documentList()
                        .title('Rules')
                        .schemaType('rule')
                        .filter('_type == "rule" && country._ref == $countryId')
                        .params({countryId}),
                    ),
                  S.listItem()
                    .title('Sources')
                    .child(
                      S.documentList()
                        .title('Sources')
                        .schemaType('source')
                        .filter('_type == "source" && country._ref == $countryId')
                        .params({countryId}),
                    ),
                ]),
            ),
        ),
      S.divider(),
      S.documentTypeListItem('route').title('Routes'),
      S.documentTypeListItem('place').title('Places and borders'),
      S.documentTypeListItem('zone').title('Low-emission zones'),
      S.divider(),
      S.listItem()
        .title('Claims seen online')
        .child(
          S.list()
            .title('Claims')
            .items([
              S.listItem()
                .title('Outdated or wrong')
                .child(
                  S.documentList()
                    .title('Outdated or wrong')
                    .schemaType('claim')
                    .filter('_type == "claim" && verdict in ["outdated", "wrong", "misleading"]'),
                ),
              S.listItem()
                .title('Still true')
                .child(
                  S.documentList()
                    .title('Still true')
                    .schemaType('claim')
                    .filter('_type == "claim" && verdict == "current"'),
                ),
            ]),
        ),
      S.listItem()
        .title('Sources by trust')
        .child(
          S.list()
            .title('Sources by trust')
            .items(
              ['official', 'club', 'press', 'blog', 'forum'].map((trust) =>
                S.listItem()
                  .title(trust)
                  .child(
                    S.documentList()
                      .title(trust)
                      .schemaType('source')
                      .filter('_type == "source" && trust == $trust')
                      .params({trust}),
                  ),
              ),
            ),
        ),
      S.documentTypeListItem('exchangeRate').title('Exchange rates'),
    ])
