import { useState } from 'react';
import { coraTemplates } from '@/data/coraTemplates';
import { Card } from './Layout';

export function Templates() {
  const [active, setActive] = useState(coraTemplates[0].id);
  const template = coraTemplates.find((t) => t.id === active)!;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">CORA &amp; Notification Letter Templates</h2>
        <p className="text-sm text-gray-500 mt-0.5">Ready-to-send templates for Colorado open records and meeting notification requests. Replace merge fields before sending.</p>
      </div>

      {/* Template selector */}
      <div className="flex flex-wrap gap-2">
        {coraTemplates.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={[
              'px-4 py-2 text-sm font-medium rounded-full border transition-colors',
              active === t.id
                ? 'bg-purple-700 text-white border-purple-700'
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
            ].join(' ')}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Template display */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-purple-50 border-b border-purple-100 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-purple-900">{template.title}</h3>
              <div className="text-xs text-purple-600 mt-0.5">Statute: {template.statute}</div>
            </div>
            <CopyButton text={template.subject} label="Copy Subject" />
          </div>

          {/* Subject line */}
          <div className="mt-3 bg-white border border-purple-200 rounded-lg px-4 py-2.5">
            <div className="text-xs text-gray-500 mb-1 font-medium">SUBJECT LINE</div>
            <div className="text-sm font-medium text-gray-800">{template.subject}</div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Letter Body</span>
            <CopyButton text={template.body} label="Copy Body" />
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-[system-ui,sans-serif] leading-relaxed">
              {template.body}
            </pre>
          </div>
        </div>

        {/* Deployment notes */}
        <div className="px-5 pb-5">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5">Deployment Notes</div>
            <p className="text-sm text-indigo-800 leading-relaxed">{template.deploymentNotes}</p>
          </div>
        </div>
      </Card>

      {/* Merge field reference */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Merge Field Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
          {[
            ['[DATE]', "Today's date (e.g. March 27, 2026)"],
            ['[CLERK NAME]', 'Name of clerk / records custodian'],
            ['[TITLE]', "Clerk's official title"],
            ['[JURISDICTION]', 'County or municipality name'],
            ['[ADDRESS]', 'Jurisdiction mailing address'],
            ['[CITY, STATE ZIP]', 'City, state, ZIP of jurisdiction'],
            ['[BOARD/COMMISSION NAME]', 'Official name of governing body'],
            ['[YOUR COMPANY]', 'Your company or organization name'],
            ['[YOUR NAME]', 'Your full name'],
            ['[YOUR TITLE]', 'Your job title'],
            ['[YOUR EMAIL]', 'Your email address'],
            ['[YOUR PHONE]', 'Your phone number'],
            ['[CONTACT NAME]', 'Name to receive notifications'],
            ['[CONTACT EMAIL]', 'Email for notifications'],
            ['[CONTACT ADDRESS]', 'Mailing address for notifications'],
            ['[START DATE]', 'Start of records request date range'],
            ['[END DATE]', 'End of records request date range'],
          ].map(([field, desc]) => (
            <div key={field} className="flex gap-2">
              <code className="text-xs bg-gray-100 text-purple-700 rounded px-1.5 py-0.5 font-mono shrink-0">{field}</code>
              <span className="text-xs text-gray-600">{desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-100 transition-colors shrink-0"
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
}
