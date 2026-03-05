import { Instructor } from '@/types';

interface InstructorCardProps {
  instructor: Instructor;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <section className="px-4 mb-8">
      <h2 className="font-editorial text-lg font-semibold mb-3">About Your Instructor</h2>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl shrink-0">
            {instructor.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{instructor.name}</h3>
            <p className="text-sm text-muted-foreground">{instructor.title}</p>
            {instructor.credentials && (
              <p className="text-xs text-primary mt-0.5">{instructor.credentials}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          {instructor.bio}
        </p>
      </div>
    </section>
  );
}
