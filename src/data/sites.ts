export interface SiteConfig {
  id: string
  name: string
  optOutUrl: string
  defaultDurationMonths: number
  /** A brief description of the site and a note that the duration is a
   *  heuristic based on community observations, not a legal fact. */
  description: string
}

export const SITES: SiteConfig[] = [
  {
    id: 'ratsit',
    name: 'Ratsit',
    optOutUrl: 'https://www.ratsit.se/ratsit/avreg',
    defaultDurationMonths: 12,
    description:
      'Ratsit publicerar personuppgifter såsom adress och inkomst. ' +
      'Avanmälan varar uppskattningsvis 12 månader — detta är en heuristik baserad på erfarenhet, inte ett juridiskt faktum.',
  },
  {
    id: 'mrkoll',
    name: 'MrKoll',
    optOutUrl: 'https://mrkoll.se/om/ta-bort-dig/',
    defaultDurationMonths: 6,
    description:
      'MrKoll visar personuppgifter, telefonnummer och karta. ' +
      'Avanmälan varar uppskattningsvis 6 månader — detta är en heuristik baserad på erfarenhet, inte ett juridiskt faktum.',
  },
  {
    id: 'hitta',
    name: 'Hitta',
    optOutUrl: 'https://www.hitta.se/kontakta-oss/ta-bort-uppgifter',
    defaultDurationMonths: 12,
    description:
      'Hitta.se listar kontaktuppgifter och kartor. ' +
      'Avanmälan varar uppskattningsvis 12 månader — detta är en heuristik baserad på erfarenhet, inte ett juridiskt faktum.',
  },
  {
    id: 'merinfo',
    name: 'Merinfo',
    optOutUrl: 'https://www.merinfo.se/ta-bort-mig',
    defaultDurationMonths: 12,
    description:
      'Merinfo samlar adress, inkomst och familjeuppgifter. ' +
      'Avanmälan varar uppskattningsvis 12 månader — detta är en heuristik baserad på erfarenhet, inte ett juridiskt faktum.',
  },
  {
    id: 'eniro',
    name: 'Eniro',
    optOutUrl: 'https://www.eniro.se/om/gdpr/',
    defaultDurationMonths: 12,
    description:
      'Eniro publicerar telefonnummer, adresser och kartor. ' +
      'Avanmälan varar uppskattningsvis 12 månader — detta är en heuristik baserad på erfarenhet, inte ett juridiskt faktum.',
  },
]
