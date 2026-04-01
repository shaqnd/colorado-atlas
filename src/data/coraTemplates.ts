import type { CoraTemplate } from './types';

export const coraTemplates: CoraTemplate[] = [
  {
    id: 'meeting-notification',
    title: 'Meeting Notification Request',
    subject: 'Request for Meeting Notification List — CRS 24-6-402(7)',
    statute: 'CRS 24-6-402(7)',
    body: `[DATE]

[CLERK NAME]
[TITLE], [JURISDICTION]
[ADDRESS]
[CITY, STATE ZIP]

Re: Request for Placement on Meeting Notification List — CRS 24-6-402(7)

Dear [CLERK NAME],

Pursuant to Colorado's Open Meetings Law, C.R.S. § 24-6-402(7), [YOUR COMPANY] hereby requests that the following contact be added to [JURISDICTION]'s meeting notification list for all regular, special, and emergency meetings of the [BOARD/COMMISSION NAME]:

Name: [CONTACT NAME]
Email: [CONTACT EMAIL]
Mailing Address: [CONTACT ADDRESS]

This notification request is effective upon receipt and valid for two (2) years from the date of this letter, as provided under § 24-6-402(7)(b). We request advance notice of all meetings including date, time, location, and meeting agenda where available.

Please confirm receipt and activation of this notification request at your earliest convenience. If your office uses an online notification portal or listserv, please provide instructions to complete enrollment through that system as a supplement to this written request.

Thank you for your attention to this matter.

Sincerely,

[YOUR NAME]
[YOUR TITLE]
[YOUR COMPANY]
[YOUR EMAIL]
[YOUR PHONE]`,
    deploymentNotes:
      'Send to county clerk (BCC meetings) and municipal clerk (city council/town board). Valid 2 years — calendar a renewal 22 months out. Confirm receipt via email follow-up within 5 business days.',
  },
  {
    id: 'cora-recordings',
    title: 'CORA — Meeting Recordings',
    subject: 'CORA Request — Audio/Video Recordings of Open Meetings',
    statute: 'CRS 24-72-201 (Colorado Open Records Act)',
    body: `[DATE]

[CLERK NAME / CUSTODIAN OF RECORDS]
[JURISDICTION]
[ADDRESS]
[CITY, STATE ZIP]

Re: Colorado Open Records Act (CORA) Request — Meeting Audio/Video Recordings

Dear [CLERK NAME],

Pursuant to the Colorado Open Records Act, C.R.S. § 24-72-201 et seq., [YOUR COMPANY] respectfully requests copies of or access to the following public records:

RECORDS REQUESTED:
All audio and/or video recordings of open meetings of the [BOARD/COMMISSION NAME] held between [START DATE] and [END DATE], including but not limited to:
  • Regular meetings
  • Special meetings
  • Work sessions (if open to the public)

PREFERRED FORMAT:
Digital files (MP3, MP4, or equivalent) via secure download link, shared drive, or email. If recordings are published to a public platform (YouTube, Granicus, Viebit, etc.), please provide direct links in lieu of file transfer.

COST WAIVER REQUEST:
[YOUR COMPANY] requests a waiver of any applicable fees on the grounds that disclosure of these records is in the public interest and will contribute to public understanding of governmental operations. If fees cannot be waived, please provide a fee estimate before proceeding.

Under CRS § 24-72-203(3), the custodian must respond within three (3) business days to allow inspection of records, or within seven (7) business days to produce copies.

Thank you for your prompt attention.

Sincerely,

[YOUR NAME]
[YOUR TITLE]
[YOUR COMPANY]
[YOUR EMAIL]
[YOUR PHONE]`,
    deploymentNotes:
      'Address to the custodian of records (often the clerk or clerk\'s office). If recordings aren\'t kept, request confirmation of retention policy. Follow up at day 4 if no response. Denial triggers appeal rights under CRS § 24-72-204.',
  },
  {
    id: 'cora-agendas-minutes',
    title: 'CORA — Agendas & Minutes',
    subject: 'CORA Request — Meeting Agendas, Packets & Minutes',
    statute: 'CRS 24-72-201; CRS 24-6-402(2)(d)',
    body: `[DATE]

[CLERK NAME / CUSTODIAN OF RECORDS]
[JURISDICTION]
[ADDRESS]
[CITY, STATE ZIP]

Re: Colorado Open Records Act (CORA) Request — Meeting Agendas, Packets & Minutes

Dear [CLERK NAME],

Pursuant to the Colorado Open Records Act, C.R.S. § 24-72-201 et seq., and the Open Meetings Law, C.R.S. § 24-6-402(2)(d), [YOUR COMPANY] requests the following public records:

RECORDS REQUESTED:
For all regular, special, and work sessions of the [BOARD/COMMISSION NAME] held between [START DATE] and [END DATE]:

  1. Meeting agendas (including any supplemental agenda items added after initial posting)
  2. Full agenda packets / staff reports distributed to board/commission members
  3. Approved minutes (final and draft, where both exist)
  4. Exhibit attachments or supporting documents submitted into the record at each meeting

ONGOING REQUEST:
[YOUR COMPANY] also requests that the above categories of records be provided on an ongoing basis as they are produced, either by email notification or posting to a public calendar/portal. Please advise if an automated notification system is available.

PREFERRED FORMAT: PDF or searchable digital format via email or secure download link.

COST WAIVER: We request fee waiver as records will be used for public benefit analysis of local government land use and planning processes.

Under CRS § 24-72-203(3), please respond within three (3) business days.

Sincerely,

[YOUR NAME]
[YOUR TITLE]
[YOUR COMPANY]
[YOUR EMAIL]
[YOUR PHONE]`,
    deploymentNotes:
      'Combine with meeting notification request for efficiency. Many jurisdictions post agendas online — verify portal first. Staff reports are often the highest-value records for land use intelligence.',
  },
  {
    id: 'dola-lgis',
    title: 'DOLA LGIS Data Request',
    subject: 'LGIS Data Request — Local Government Meeting Inventory (CRS 24-32-116)',
    statute: 'CRS 24-32-116 (DOLA Local Government Information System)',
    body: `[DATE]

Local Government Information System (LGIS)
Colorado Department of Local Affairs (DOLA)
1313 Sherman Street, Room 521
Denver, CO 80203
Email: dola_lgis@state.co.us

Re: Request for Local Government Meeting Data Export — CRS 24-32-116

To Whom It May Concern:

Pursuant to C.R.S. § 24-32-116, which requires DOLA to maintain and make available a comprehensive inventory of local government information, [YOUR COMPANY] requests the following data from the Local Government Information System (LGIS):

DATA REQUESTED:
  1. A complete, current listing of all Colorado local governments (counties, municipalities, special districts, school districts) with:
     a. Official name and DOLA entity ID
     b. Governing body meeting schedule (frequency, day, time)
     c. Meeting agenda / notice publication URL
     d. Meeting minutes URL
     e. Video/audio recording URL or platform (if available)
     f. Clerk / records custodian contact (name, email, phone)
     g. Primary website URL

  2. The most recent LGIS data export in machine-readable format (CSV, JSON, or Excel preferred)

INTENDED USE:
This data will be used to build a statewide public monitoring system for local government land use decisions, for the benefit of property owners, researchers, and the general public.

PREFERRED DELIVERY: Email attachment or secure download link to [YOUR EMAIL].

If a formal CORA request is required, please confirm and this letter will serve as such under CRS § 24-72-201.

Thank you,

[YOUR NAME]
[YOUR TITLE]
[YOUR COMPANY]
[YOUR EMAIL]
[YOUR PHONE]`,
    deploymentNotes:
      'Send to DOLA LGIS directly. This is the highest-leverage first step — a single request can yield meeting URLs for 2,000+ local governments statewide. Follow up by phone if no response in 5 business days. LGIS data quality varies; cross-reference against county clerk websites.',
  },
];

export const coraTemplatesById: Record<string, CoraTemplate> = Object.fromEntries(
  coraTemplates.map((t) => [t.id, t])
);
