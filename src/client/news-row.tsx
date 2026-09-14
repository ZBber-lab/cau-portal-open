/**
 * 要闻行与小组件的共享实现（首页「今日要览」与「要闻」二级页共用）。
 * 2026-09-14 用户拍板：要闻从首页移到二级页（首页只留一行「要闻 ›」入口），
 * 行渲染抽到这里，避免两处各写一份后漂移。
 */
import { Ic } from './icons'

export function fmtCn(iso: string | null | undefined): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(iso)
  return m ? `${+m[2]}月${+m[3]}日` : ''
}

export function ImpBadge({ level }: { level?: string }) {
  const cls = level === '高' ? 'dsh-cau_badgeHigh' : level === '中' ? 'dsh-cau_badgeMid' : 'dsh-cau_badgeLow'
  return <span className={`dsh-cau_badge ${cls}`}>{level || '低'}</span>
}

/** 要闻行：点标题进步详情 / ☆ 关注 / 归档（归档后从要闻移除，可在「归档」视图找回） */
export function NewsRow(props: {
  it: any
  read: boolean
  followed: boolean
  hit: boolean
  onOpen: () => void
  onToggleFollow: () => void
  onArchive: () => void
}) {
  const { it, read, followed, hit } = props
  return (
    <div className="dsh-cau_impRow">
      <span className="dsh-cau_impDot" data-read={read ? '1' : '0'} />
      <span className="dsh-cau_impMain" onClick={props.onOpen}>
        <span className="dsh-cau_impTop">
          <span className="dsh-cau_impTitle">{it.title}</span>
          <ImpBadge level={it.importance} />
          {hit && (
            <span className="dsh-cau_impHit" title="命中关注规则">
              <Ic n="target" />
            </span>
          )}
        </span>
        {it.summary && <span className="dsh-cau_impSummary">{it.summary}</span>}
        <span className="dsh-cau_impMeta">{[it.column, it.source, fmtCn(it.time)].filter(Boolean).join(' · ')}</span>
      </span>
      <span className="dsh-cau_impActs">
        <button type="button" className={'dsh-cau_followBtn' + (followed ? ' dsh-cau_on' : '')} title={followed ? '取消关注' : '加入关注'} onClick={props.onToggleFollow}>
          <Ic n={followed ? 'starFill' : 'star'} />
        </button>
        <button type="button" className="dsh-cau_impArch" title="归档（从此处移除，可在「归档」视图中找回）" onClick={props.onArchive}>
          <Ic n="archive" />
        </button>
      </span>
    </div>
  )
}
