'use server'

import { revalidatePath } from 'next/cache'

import { createServiceRoleClient } from '@/lib/supabase/server'

export async function setUserRole(userId: string, formData: FormData) {
  const role = (formData.get('role') ?? '').toString()
  if (role !== 'student' && role !== 'admin') {
    throw new Error('Ongeldige rol.')
  }

  const admin = createServiceRoleClient()
  const { error } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) {
    console.error('[admin] rol wijzigen mislukt', error.code, error.message)
    throw new Error('Rol wijzigen is niet gelukt. Probeer het nog eens.')
  }

  revalidatePath('/admin/users')
}
