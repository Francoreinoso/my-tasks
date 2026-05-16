import { useState, type KeyboardEvent } from 'react';
import { CaretDown, CaretRight, Trash } from '@phosphor-icons/react';
import type { StudyTopic } from '@/types/study';
import { StudyItemRow } from '@/components/molecules/StudyItemRow';
import { StudyLinkRow } from '@/components/molecules/StudyLinkRow';
import { NewStudyItemInput } from '@/components/molecules/NewStudyItemInput';
import { NewStudyLinkForm } from '@/components/molecules/NewStudyLinkForm';

interface StudyTopicCardProps {
  topic: StudyTopic;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onAddItem: (topicId: string, label: string) => Promise<void> | void;
  onUpdateItem: (topicId: string, itemId: string, label: string) => void;
  onToggleItem: (topicId: string, itemId: string) => void;
  onRemoveItem: (topicId: string, itemId: string) => void;
  onAddLink: (topicId: string, label: string, url: string) => Promise<void> | void;
  onUpdateLink: (
    topicId: string,
    linkId: string,
    changes: { label?: string; url?: string },
  ) => void;
  onRemoveLink: (topicId: string, linkId: string) => void;
}

export function StudyTopicCard({
  topic,
  onUpdateTitle,
  onDelete,
  onAddItem,
  onUpdateItem,
  onToggleItem,
  onRemoveItem,
  onAddLink,
  onUpdateLink,
  onRemoveLink,
}: StudyTopicCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(topic.title);

  const totalItems = topic.items.length;
  const doneItems = topic.items.filter((i) => i.completed).length;

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed.length === 0 || trimmed === topic.title) {
      setTitleDraft(topic.title);
      setIsEditingTitle(false);
      return;
    }
    onUpdateTitle(topic.id, trimmed);
    setIsEditingTitle(false);
  };

  const cancelTitle = () => {
    setTitleDraft(topic.title);
    setIsEditingTitle(false);
  };

  const handleTitleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitTitle();
    if (e.key === 'Escape') cancelTitle();
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar el tema "${topic.title}" y todos sus subtemas?`)) {
      onDelete(topic.id);
    }
  };

  const Caret = expanded ? CaretDown : CaretRight;

  return (
    <article className="rounded-lg border border-border-default bg-bg-surface/60 backdrop-blur-sm">
      <header className="group flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Colapsar tema' : 'Expandir tema'}
          aria-expanded={expanded}
          className="rounded p-1 text-text-muted hover:bg-bg-elevated"
        >
          <Caret weight="light" size={16} />
        </button>

        {isEditingTitle ? (
          <input
            autoFocus
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={handleTitleKey}
            aria-label="Editar título del tema"
            maxLength={200}
            className="flex-1 rounded-md border border-border-strong bg-bg-elevated px-2 py-1 text-base font-medium text-text-primary focus:border-accent focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => setIsEditingTitle(true)}
            aria-label={`Editar título "${topic.title}" (doble click)`}
            className="flex-1 cursor-text text-left text-base font-medium text-text-primary"
          >
            {topic.title}
          </button>
        )}

        {totalItems > 0 && (
          <span className="shrink-0 font-mono text-xs text-text-muted">
            {doneItems}/{totalItems}
          </span>
        )}

        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Eliminar tema "${topic.title}"`}
          className="rounded p-1 text-text-subtle opacity-0 transition-opacity hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash weight="light" size={16} />
        </button>
      </header>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-border-default px-3 py-3">
          {/* Links section */}
          <section aria-label="Recursos">
            <div className="flex flex-col gap-1">
              {topic.links.map((link) => (
                <StudyLinkRow
                  key={link.id}
                  link={link}
                  onUpdate={(linkId, changes) => onUpdateLink(topic.id, linkId, changes)}
                  onDelete={(linkId) => onRemoveLink(topic.id, linkId)}
                />
              ))}
              <NewStudyLinkForm
                onAdd={(label, url) => onAddLink(topic.id, label, url)}
              />
            </div>
          </section>

          {/* Items section */}
          <section aria-label="Subtemas" className="border-t border-border-default pt-3">
            <div className="flex flex-col gap-1">
              {topic.items.map((item) => (
                <StudyItemRow
                  key={item.id}
                  item={item}
                  onToggle={(itemId) => onToggleItem(topic.id, itemId)}
                  onUpdate={(itemId, label) => onUpdateItem(topic.id, itemId, label)}
                  onDelete={(itemId) => onRemoveItem(topic.id, itemId)}
                />
              ))}
              <NewStudyItemInput
                onAdd={(label) => onAddItem(topic.id, label)}
              />
            </div>
          </section>
        </div>
      )}
    </article>
  );
}
