import { useStudy } from '@/hooks/useStudy';
import { NewStudyTopicForm } from '@/components/molecules/NewStudyTopicForm';
import { StudyTopicCard } from '@/components/organisms/StudyTopicCard';

export function EstudioPage() {
  const {
    topics,
    status,
    error,
    createTopic,
    updateTopicTitle,
    deleteTopic,
    addItem,
    updateItem,
    toggleItem,
    removeItem,
    addLink,
    updateLink,
    removeLink,
  } = useStudy();

  return (
    <section className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h2 className="font-mono text-3xl tracking-tight text-text-primary">Estudio</h2>
        <p className="text-sm text-text-muted">
          Temas que querés aprender, con recursos y subtemas. Doble click para editar.
        </p>
      </header>

      <div className="mb-6">
        <NewStudyTopicForm
          onSubmit={async (title) => {
            await createTopic(title);
          }}
          disabled={status === 'loading'}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {status === 'loading' && topics.length === 0 ? (
        <p className="text-text-muted">Cargando temas…</p>
      ) : topics.length === 0 ? (
        <div
          role="status"
          className="rounded-lg border border-dashed border-border-default bg-bg-surface/40 p-10 text-center text-text-muted"
        >
          <p className="text-sm">Todavía no tenés temas de estudio.</p>
          <p className="text-xs text-text-subtle">
            Creá tu primer tema arriba — por ejemplo "React" o "Inglés".
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {topics.map((topic) => (
            <StudyTopicCard
              key={topic.id}
              topic={topic}
              onUpdateTitle={(id, title) => void updateTopicTitle(id, title)}
              onDelete={(id) => void deleteTopic(id)}
              onAddItem={(topicId, label) => addItem(topicId, label)}
              onUpdateItem={(topicId, itemId, label) =>
                void updateItem(topicId, itemId, label)
              }
              onToggleItem={(topicId, itemId) => void toggleItem(topicId, itemId)}
              onRemoveItem={(topicId, itemId) => void removeItem(topicId, itemId)}
              onAddLink={(topicId, label, url) => addLink(topicId, label, url)}
              onUpdateLink={(topicId, linkId, changes) =>
                void updateLink(topicId, linkId, changes)
              }
              onRemoveLink={(topicId, linkId) => void removeLink(topicId, linkId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
