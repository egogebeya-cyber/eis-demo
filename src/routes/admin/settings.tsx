import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getSettingsFn } from '~/server/public/functions'
import { updateAlertFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/settings')({
  loader: async () => ({ site: await getSettingsFn() }),
  component: AdminSettings,
})

function AdminSettings() {
  const { site } = Route.useLoaderData()
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await updateAlertFn({
      data: {
        alertEnabled: form.get('alertEnabled') === 'on',
        alertEn: String(form.get('alertEn') || ''),
      },
    })
    await router.invalidate()
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-school-dark">Alert banner</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Optional. The public site also shows the latest announcement marked Website. Leave this off unless you want a fallback message.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="soft-card mt-6 space-y-3 bg-white shadow-sm">
        <label className="flex items-center gap-2 text-sm">
          <input name="alertEnabled" type="checkbox" defaultChecked={site?.alertEnabled} />
          Show banner
        </label>
        <textarea name="alertEn" defaultValue={site?.alertEn} rows={3} className="w-full rounded-xl border border-school/20 px-3 py-2" />
        <button type="submit" className="rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white">
          Save
        </button>
      </form>
    </div>
  )
}
