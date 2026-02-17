import { getStore } from '@/infrastructure/repositories/SingletonStore';
import { Member } from '@/domain/entities/Member';

export class MemberService {

  createMember(name: string, email: string, phone?: string): Member {
    const store = getStore();
    const id = `member-${Date.now()}`;
    const member = new Member(id, name, email, phone || null, true);
    store.memberRepository.save(member);
    return member;
  }

  getAll(): Member[] {
    return getStore().memberRepository.findAll();
  }

  getById(id: string): Member | null {
    return getStore().memberRepository.findById(id);
  }

  activate(id: string): Member {
    const store = getStore();
    const member = store.memberRepository.findById(id);
    if (!member) throw new Error('Miembro no encontrado');
    member.activate();
    store.memberRepository.save(member);
    return member;
  }

  deactivate(id: string): Member {
    const store = getStore();
    const member = store.memberRepository.findById(id);
    if (!member) throw new Error('Miembro no encontrado');
    member.deactivate();
    store.memberRepository.save(member);
    return member;
  }
}

export const memberService = new MemberService();
