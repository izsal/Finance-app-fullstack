import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    return apiSuccess(user, 'Profil pengguna berhasil didapatkan')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized. Silakan sertakan header Authorization: Bearer <token>', 401)
    }
    return apiError(err?.message || 'Gagal memproses permintaan', 500)
  }
}
