import { useState, type KeyboardEvent } from 'react';
import {
  ArrowSquareOut,
  GithubLogo,
  LinkSimple,
  NotePencil,
  Trash,
  YoutubeLogo,
  type Icon,
} from '@phosphor-icons/react';
import { detectLinkKind } from '@/lib/linkType';
import type { StudyLink } from '@/types/study';

interface StudyLinkRowProps {
  link: StudyLink;
  onUpdate: (linkId: string, changes: { label?: string; url?: string }) => void;
  onDelete: (linkId: string) => void;
}

const ICON_BY_KIND: Record<ReturnType<typeof detectLinkKind>, Icon> = {
  youtube: YoutubeLogo,
  notebooklm: NotePencil,
  github: GithubLogo,
  generic: LinkSimple,
};

export function StudyLinkRow({ link, onUpdate, onDelete }: StudyLinkRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState(link.label);
  const [urlDraft, setUrlDraft] = useState(link.url);

  const KindIcon = ICON_BY_KIND[detectLinkKind(link.url)];

  const startEdit = () => {
    setLabelDraft(link.label);
    setUrlDraft(link.url);
    setIsEditing(true);
  };

  const commit = () => {
    const label = labelDraft.trim();
    const url = urlDraft.trim();
    if (label.length === 0 || url.length === 0) {
      cancel();
      return;
    }
    const changes: { label?: string; url?: string } = {};
    if (label !== link.label) changes.label = label;
    if (url !== link.url) changes.url = url;
    if (Object.keys(changes).length > 0) {
      onUpdate(link.id, changes);
    }
    setIsEditing(false);
  };

  const cancel = () => {
    setLabelDraft(link.label);
    setUrlDraft(link.url);
    setIsEditing(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border-strong bg-bg-elevated px-2 py-1">
        <KindIcon weight="light" size={18} className="shrink-0 text-text-muted" />
        <input
          autoFocus
          type="text"
          value={labelDraft}
          onChange={(e) => setLabelDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Etiqueta"
          aria-label="Editar etiqueta del link"
          maxLength={100}
          className="w-32 rounded-sm bg-transparent px-1 text-sm text-text-primary focus:outline-none"
        />
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={commit}
          placeholder="https://..."
          aria-label="Editar URL del link"
          className="flex-1 rounded-sm bg-transparent px-1 text-xs text-text-muted focus:outline-none"
        />
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-bg-elevated/50">
      <KindIcon weight="light" size={18} className="shrink-0 text-text-muted" />
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center gap-1 truncate text-sm text-text-primary hover:text-accent"
        title={link.url}
      >
        <span className="truncate">{link.label}</span>
        <ArrowSquareOut weight="light" size={14} className="shrink-0 opacity-60" />
      </a>
      <button
        type="button"
        onClick={startEdit}
        aria-label={`Editar link "${link.label}"`}
        className="rounded p-1 text-text-subtle opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100 focus-visible:opacity-100"
      >
        <NotePencil weight="light" size={14} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(link.id)}
        aria-label={`Eliminar link "${link.label}"`}
        className="rounded p-1 text-text-subtle opacity-0 transition-opacity hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Trash weight="light" size={14} />
      </button>
    </div>
  );
}
