'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { updateProfile, type UpdateProfileState } from '@/lib/actions';

type ProfileEditFormProps = {
    email: string;
    initialName: string;
    initialPhone: string;
    initialBirthDate: string;
};

const initialState: UpdateProfileState = {
    success: false,
    message: '',
};

function normalizePhoneNumber(value: string) {
    return value.replace(/\D/g, '').slice(0, 11);
}

function formatPhoneNumber(value: string) {
    const digits = normalizePhoneNumber(value);

    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, digits.length === 10 ? 6 : 7)}-${digits.slice(digits.length === 10 ? 6 : 7)}`;
}

export default function ProfileEditForm({
    email,
    initialName,
    initialPhone,
    initialBirthDate,
}: ProfileEditFormProps) {
    const [state, formAction] = useActionState(updateProfile, initialState);
    const [phone, setPhone] = useState(initialPhone);

    useEffect(() => {
        setPhone(initialPhone);
    }, [initialPhone]);

    return (
        <form action={formAction} className="rounded-lg border border-[#ded4c8] bg-white/86 p-5 shadow-[0_18px_55px_rgba(70,54,36,0.08)] sm:p-7">
            <div className="grid gap-5">
                <Field label="이메일">
                    <input
                        value={email}
                        readOnly
                        className="h-13 w-full rounded-md border border-[#e4d8c8] bg-[#f7f1e8] px-4 text-sm text-[#776b61] outline-none"
                    />
                </Field>

                <Field label="이름">
                    <input
                        name="name"
                        defaultValue={initialName}
                        required
                        autoComplete="name"
                        placeholder="이름을 입력해주세요"
                        className="h-13 w-full rounded-md border border-[#ddd0be] bg-white px-4 text-sm text-[#241c15] outline-none transition-colors focus:border-[#b7864c]"
                    />
                </Field>

                <Field label="휴대폰 번호">
                    <input
                        name="phone"
                        value={formatPhoneNumber(phone)}
                        onChange={(event) => setPhone(normalizePhoneNumber(event.target.value))}
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="010-0000-0000"
                        className="h-13 w-full rounded-md border border-[#ddd0be] bg-white px-4 text-sm text-[#241c15] outline-none transition-colors focus:border-[#b7864c]"
                    />
                </Field>

                <Field label="생년월일">
                    <input
                        name="birthDate"
                        type="date"
                        defaultValue={initialBirthDate}
                        className="h-13 w-full rounded-md border border-[#ddd0be] bg-white px-4 text-sm text-[#241c15] outline-none transition-colors focus:border-[#b7864c]"
                    />
                </Field>
            </div>

            {state.message && (
                <div className={`mt-5 flex items-start gap-2 rounded-md border px-4 py-3 text-sm ${
                    state.success
                        ? 'border-[#b8d4c1] bg-[#eefaf1] text-[#347247]'
                        : 'border-red-200 bg-red-50 text-red-700'
                }`}>
                    {state.success && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
                    <p>{state.message}</p>
                </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                    href="/profile"
                    className="inline-flex h-12 items-center justify-center rounded-md border border-[#d7c6af] px-5 text-sm font-semibold text-[#66584a] transition-colors hover:bg-[#f7efe4]"
                >
                    돌아가기
                </Link>
                <SaveButton />
            </div>
        </form>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#5f5348]">{label}</span>
            {children}
        </label>
    );
}

function SaveButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#bd8a4c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#aa793d] disabled:cursor-wait disabled:opacity-70"
        >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            저장
        </button>
    );
}
