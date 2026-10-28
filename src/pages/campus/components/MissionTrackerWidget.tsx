import { Scroll, CheckCircle2, ArrowRight, Clock, X } from 'lucide-react'
import { useApp, type Mission } from '@/context/AppContext'

export default function MissionTrackerWidget({
  onSelectMission,
  onClose,
}: {
  onSelectMission: (mission: Mission) => void
  /** Hides the panel; the HUD's Quests button brings it back. */
  onClose: () => void
}) {
  const { missions, lang } = useApp()

  const activeMissions = missions.filter((m) => !m.completed)
  const completedMissions = missions.filter((m) => m.completed)

  return (
    <div className="pointer-events-auto absolute right-4 top-20 z-20 w-80">
      <div className="overflow-hidden rounded-3xl border border-white/20 bg-black/75 p-4 text-white shadow-2xl backdrop-blur-xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-lg">
              <Scroll className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-extrabold tracking-wide uppercase text-white">
                  {lang === 'th' ? 'เควสต์ & การบ้าน' : 'Quests & Homework'}
                </h3>
                <span className="flex h-5 items-center justify-center rounded-full bg-pink-500/30 px-1.5 text-[10px] font-black text-pink-300 border border-pink-400/40">
                  {activeMissions.length}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={lang === 'th' ? 'ปิดเควสต์' : 'Close quests'}
            title={lang === 'th' ? 'ปิด (เปิดใหม่ได้ที่ปุ่มเควสต์ด้านบน)' : 'Close (reopen from Quests at the top)'}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/25 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mission List */}
        {(
          <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
            {activeMissions.map((mission) => {
              const isExam = mission.type === 'exam'
              const isQuiz = mission.type === 'quiz'

              return (
                <div
                  key={mission.id}
                  className={`group rounded-2xl p-3 transition-all border ${
                    isExam
                      ? 'border-amber-400/50 bg-gradient-to-r from-amber-950/40 to-black/60 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                      : isQuiz
                      ? 'border-purple-400/30 bg-purple-950/30'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">
                          {isExam ? '⚔️' : isQuiz ? '🎯' : mission.type === 'drill' ? '🧠' : '📝'}
                        </span>
                        <h4 className="font-bold text-xs leading-tight text-white group-hover:text-pink-300 transition-colors">
                          {lang === 'en' && mission.titleEn ? mission.titleEn : mission.title}
                        </h4>
                      </div>
                      <p className="mt-1 text-[11px] text-white/70 line-clamp-1 leading-relaxed">
                        {lang === 'en' && mission.descriptionEn ? mission.descriptionEn : mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Rewards & Action Bar */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-amber-300 font-extrabold text-[10px]">
                        <span>+{mission.xpReward}</span>
                        <span className="text-[9px] text-amber-400/80">XP</span>
                      </span>
                      <span className="flex items-center gap-0.5 text-yellow-300 font-extrabold text-[10px]">
                        <span>+{mission.coinReward}</span>
                        <span className="text-[9px]">🪙</span>
                      </span>
                      {mission.dueDate && (
                        <span className="flex items-center gap-0.5 text-white/50 text-[10px]">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{lang === 'en' && mission.dueDateEn ? mission.dueDateEn : mission.dueDate}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectMission(mission)}
                      className="flex items-center gap-1 rounded-xl bg-pink-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-pink-500 transition-all shadow-lg cursor-pointer group-hover:translate-x-0.5"
                    >
                      <span>{lang === 'th' ? 'ทำเควสต์' : 'Start Quest'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Completed Section Summary */}
            {completedMissions.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {lang === 'th' ? 'ภารกิจที่พิชิตแล้ว' : 'Completed Missions'} ({completedMissions.length})
                </p>
                <div className="mt-1.5 space-y-1">
                  {completedMissions.map((cm) => (
                    <div
                      key={cm.id}
                      className="flex items-center justify-between rounded-xl bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-1 text-[10px] text-white/60"
                    >
                      <span className="line-through">{lang === 'en' && cm.titleEn ? cm.titleEn : cm.title}</span>
                      <span className="text-emerald-400 font-bold">{lang === 'th' ? 'สำเร็จแล้ว ✓' : 'Completed ✓'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
