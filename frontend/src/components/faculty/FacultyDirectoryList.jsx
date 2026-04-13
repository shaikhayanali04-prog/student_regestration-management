import { Link } from "react-router-dom";
import { MoveRight, Pencil, Trash2, UserRound, Users } from "lucide-react";
import { Button } from "../ui/button";
import FacultyStatusBadge from "./FacultyStatusBadge";

export default function FacultyDirectoryList({ faculty = [], onEdit, onDelete }) {
  return (
    <div className="divide-y divide-border">
      {faculty.map((member) => (
        <div
          key={member.id}
          className="grid gap-5 px-6 py-5 transition-colors hover:bg-muted/10 xl:grid-cols-[1.4fr,0.9fr,0.8fr,0.7fr,0.8fr]"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-foreground">{member.full_name}</p>
                <FacultyStatusBadge value={member.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {member.faculty_id} {member.email ? `- ${member.email}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {member.subject_specialization?.length ? (
                  member.subject_specialization.slice(0, 4).map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    No specialization added
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Contact
            </p>
            <div className="mt-3 space-y-2 text-sm text-foreground">
              <p>{member.phone || "Phone not added"}</p>
              <p className="text-muted-foreground">
                Joined {member.joining_date || "Not recorded"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Batch Load
            </p>
            <p className="mt-3 text-2xl font-black text-foreground">
              {member.assigned_batches_count || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              {member.active_batches_count || 0} active batches
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Reach
            </p>
            <div className="mt-3 flex items-center gap-2 text-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold">{member.student_coverage || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">students covered</p>
          </div>

          <div className="flex flex-wrap items-start justify-start gap-2 xl:justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/faculty/${member.id}`}>
                <MoveRight className="mr-2 h-4 w-4" />
                View
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(member)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
