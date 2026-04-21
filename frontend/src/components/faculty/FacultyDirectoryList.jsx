import { Link } from "react-router-dom";
import { MoveRight, Pencil, Trash2, UserRound, Users } from "lucide-react";
import { Button } from "../ui/button";
import FacultyStatusBadge from "./FacultyStatusBadge";

export default function FacultyDirectoryList({ faculty = [], onEdit, onDelete }) {
  return (
    <div className="divide-y divide-gray-100">
      {faculty.map((member) => (
        <div
          key={member.id}
          className="grid gap-5 px-6 py-5 transition-colors hover:bg-blue-50/30 xl:grid-cols-[1.4fr,0.9fr,0.8fr,0.7fr,0.8fr]"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 text-primary">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-text-primary">{member.full_name}</p>
                <FacultyStatusBadge value={member.status} />
              </div>
              <p className="mt-1 text-sm text-text-secondary">
                {member.faculty_id} {member.email ? `| ${member.email}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {member.subject_specialization?.length ? (
                  member.subject_specialization.slice(0, 4).map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full border border-primary/10 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-text-secondary">
                    No specialization added
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
              Contact
            </p>
            <div className="mt-3 space-y-2 text-sm text-text-primary">
              <p>{member.phone || "Phone not added"}</p>
              <p className="text-text-secondary">
                Joined {member.joining_date || "Not recorded"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
              Batch Load
            </p>
            <p className="mt-3 font-mono text-2xl font-black text-text-primary">
              {member.assigned_batches_count || 0}
            </p>
            <p className="text-sm text-text-secondary">
              {member.active_batches_count || 0} active batches
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
              Reach
            </p>
            <div className="mt-3 flex items-center gap-2 text-text-primary">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-mono text-lg font-bold">{member.student_coverage || 0}</span>
            </div>
            <p className="text-sm text-text-secondary">students covered</p>
          </div>

          <div className="flex flex-wrap items-start justify-start gap-2 xl:justify-end">
            <Button variant="outline" size="icon" asChild aria-label="View faculty">
              <Link to={`/admin/faculty/${member.id}`}>
                <MoveRight className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={() => onEdit(member)} aria-label="Edit faculty">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => onDelete(member)} aria-label="Delete faculty">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
