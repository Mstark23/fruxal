// =============================================================================
// app/v2/settings/team/page.tsx — Team member management
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  role: string;
  joined_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-[#1B3A2D] text-white",
  ADMIN: "bg-[#1B3A2D]/10 text-[#1B3A2D]",
  VIEWER: "bg-[#E5E3DD] text-[#6B6560]",
};

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [callerRole, setCallerRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("VIEWER");
  const [inviting, setInviting] = useState(false);

  // Remove
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v2/team");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to load team");
      }
      const data = await res.json();
      setMembers(data.members || []);
      setCallerRole(data.callerRole || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/v2/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invite");

      setSuccess(`${inviteEmail.trim()} has been added as ${inviteRole}`);
      setInviteEmail("");
      setInviteRole("VIEWER");
      fetchMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail} from this team?`)) return;
    setRemoving(memberId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/v2/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove");

      setSuccess(`${memberEmail} has been removed`);
      fetchMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRemoving(null);
    }
  };

  const isOwner = callerRole === "OWNER";
  const canInvite = ["OWNER", "ADMIN"].includes(callerRole);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/v2/settings")}
            className="w-8 h-8 rounded-lg border border-[#E5E3DD] bg-white flex items-center justify-center text-[#6B6560] hover:bg-[#F5F3EF] transition"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-serif font-semibold text-[#1B3A2D]">Team Members</h1>
            <p className="text-sm text-[#6B6560] mt-0.5">Manage who has access to this business</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-600 ml-2">&times;</button>
          </div>
        )}

        {/* Invite form */}
        {canInvite && (
          <div className="bg-white rounded-xl border border-[#E5E3DD] p-5 mb-6">
            <h2 className="text-sm font-semibold text-[#1B3A2D] mb-3">Invite a team member</h2>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="flex-1 px-3 py-2 rounded-lg border border-[#E5E3DD] bg-[#FAFAF8] text-sm text-[#1B3A2D] placeholder:text-[#A09A93] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]/30"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E5E3DD] bg-[#FAFAF8] text-sm text-[#1B3A2D] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20"
              >
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button
                type="submit"
                disabled={inviting}
                className="px-5 py-2 rounded-lg bg-[#1B3A2D] text-white text-sm font-medium hover:bg-[#1B3A2D]/90 transition disabled:opacity-50 whitespace-nowrap"
              >
                {inviting ? "Sending..." : "Send Invite"}
              </button>
            </form>
          </div>
        )}

        {/* Members list */}
        <div className="bg-white rounded-xl border border-[#E5E3DD] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E5E3DD]">
            <h2 className="text-sm font-semibold text-[#1B3A2D]">
              Current members{!loading && ` (${members.length})`}
            </h2>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[#E5E3DD] border-t-[#1B3A2D] rounded-full animate-spin" />
              <p className="text-sm text-[#6B6560] mt-3">Loading team...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-[#6B6560]">No team members found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E3DD]">
              {members.map((member) => (
                <div key={member.id} className="px-5 py-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#1B3A2D]/5 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[#1B3A2D]">
                      {(member.name || member.email)[0].toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[#1B3A2D] truncate">
                        {member.name || member.email}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${ROLE_COLORS[member.role] || ROLE_COLORS.VIEWER}`}>
                        {member.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {member.name && (
                        <p className="text-xs text-[#6B6560] truncate">{member.email}</p>
                      )}
                      <span className="text-[10px] text-[#A09A93]">
                        Joined {new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Remove button */}
                  {isOwner && member.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemove(member.id, member.email)}
                      disabled={removing === member.id}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50 flex-shrink-0"
                    >
                      {removing === member.id ? "Removing..." : "Remove"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
